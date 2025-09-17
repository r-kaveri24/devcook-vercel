
import { z } from "zod"
import { Sandbox } from '@e2b/code-interpreter';
import { openai, createAgent, createTool, createNetwork } from "@inngest/agent-kit";

import { PROMPT } from "@/prompt";
import { inngest } from "@/inngest/client";
import { getSandbox, lastAssistantTextMessageContent } from '@/inngest/utils';

export const helloWorld = inngest.createFunction(
    { id: "hello-world2" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        const sandboxId = await step.run('get-sandbox-id', async () => {
            const sandbox = await Sandbox.create("vibe-nextjs-test-12345");
            return sandbox.sandboxId;
        });

        const codeAgent = createAgent({
            name: "code-agent",
            description: "An expert frontend agent",
            system: PROMPT,
            model: openai({
                model: "gpt-4.1",
                defaultParameters: {
                    temperature: 0.1,
                },
            }),
            tools: [
                createTool({
                    name: "terminal",
                    description: "Use the terminal to run commands",
                    parameters: z.object({
                        command: z.string(),
                    }),
                    handler: async ({ command }, { step }) => {
                        return await step?.run("terminal", async () => {
                            const buffers = { stdout: "", stderr: "" };

                            try {
                                const sandbox = await getSandbox(sandboxId);
                                const result = await sandbox.commands.run(command, {
                                    onStdout: (data: string) => {
                                        buffers.stdout += data;
                                    },
                                    onStderr: (data: string) => {
                                        buffers.stderr += data
                                    },
                                });
                                return result.stdout;
                            } catch (e) {
                                console.error(
                                    `command failed ${e} \n stdout: ${buffers.stdout}\n stderror: ${buffers.stderr}`
                                );
                                return `command failed ${e} \n stdout: ${buffers.stdout}\n stderror: ${buffers.stderr}`
                            }
                        });

                    },

                }),
                createTool({
                    name: "createOrUpdateFiles",
                    description: "Create or update files in the sandbox with force overwrite and verification",
                    parameters: z.object({
                        files: z.array(
                            z.object({
                                path: z.string(),
                                content: z.string(),
                            }),
                        ),
                    }),

                    handler: async (
                        { files },
                        { step, network }
                    ) => {
                        const newFiles = await step?.run("createOrUpdateFiles", async () => {
                            try {
                                const updatedFiles = network.state.data.files || {};
                                const sandbox = await getSandbox(sandboxId);
                                const results = [];

                                for (const file of files) {
                                    let success = false;
                                    let attempts = 0;
                                    const maxAttempts = 3;

                                    while (!success && attempts < maxAttempts) {
                                        attempts++;

                                        try {
                                            // Force write the file (E2B files.write overwrites by default)
                                            await sandbox.files.write(file.path, file.content);

                                            // Verify the file was written correctly
                                            const writtenContent = await sandbox.files.read(file.path);

                                            if (writtenContent === file.content) {
                                                updatedFiles[file.path] = file.content;
                                                results.push({ path: file.path, status: 'success', attempts });
                                                success = true;
                                            } else {
                                                console.warn(`File verification failed for ${file.path}, attempt ${attempts}`);
                                                if (attempts === maxAttempts) {
                                                    results.push({
                                                        path: file.path,
                                                        status: 'verification_failed',
                                                        attempts,
                                                        expected_length: file.content.length,
                                                        actual_length: writtenContent.length
                                                    });
                                                }
                                            }
                                        } catch (writeError) {
                                            console.error(`Write attempt ${attempts} failed for ${file.path}:`, writeError);
                                            if (attempts === maxAttempts) {
                                                results.push({
                                                    path: file.path,
                                                    status: 'write_failed',
                                                    attempts,
                                                    error: String(writeError)
                                                });
                                            } else {
                                                // Wait before retry
                                                await new Promise(resolve => setTimeout(resolve, 100 * attempts));
                                            }
                                        }
                                    }
                                }

                                // Log results for debugging
                                console.log('File operation results:', results);

                                return { files: updatedFiles, results };
                            } catch (e) {
                                console.error('createOrUpdateFiles error:', e);
                                return { error: String(e), files: network.state.data.files || {} };
                            }
                        });

                        if (newFiles && typeof newFiles === "object" && newFiles.files) {
                            network.state.data.files = newFiles.files;
                            // Store operation results for debugging
                            if (!('error' in newFiles)) {
                                // Success case - has results property
                                network.state.data.lastFileOperationResults = newFiles.results;
                            } else {
                                // Error case - store error info
                                network.state.data.lastFileOperationResults = { error: newFiles.error };
                            }
                        }
                    }
                }),
                createTool({
                    name: "readFiles",
                    description: "Read files from the sandbox",
                    parameters: z.object({
                        files: z.array(z.string()),
                    }),
                    handler: async ({ files }, { step }) => {
                        return await step?.run("readFiles", async () => {
                            try {
                                const sandbox = await getSandbox(sandboxId);
                                const contents = [];
                                for (const file of files) {
                                    const content = await sandbox.files.read(file);
                                    contents.push({
                                        path: file,
                                        content,
                                    })
                                }
                                return JSON.stringify(contents);
                            } catch (e) {
                                return "Error: " + e;
                            }
                        })
                    },
                })

            ],
            lifecycle: {
                onResponse: async ({ result, network }) => {
                    const lastAssistantMessageText = lastAssistantTextMessageContent(result);
                    if (lastAssistantMessageText && network) {
                        if (lastAssistantMessageText.includes("<task_summary>")) {
                            network.state.data.summary = lastAssistantMessageText;
                        }
                    }

                    return result;
                },
            },
        });

        const network = createNetwork({
            name: "coding-agent-network",
            agents: [codeAgent],
            maxIter: 15,
            router: async ({ network }) => {
                const summary = network.state.data.summary;

                if (summary) {
                    return;
                }

                return codeAgent;
            }
        })

        const result = await network.run(event.data.value)

        const sandboxUrl = await step.run('get-sandbox-url', async () => {
            const sandbox = await Sandbox.create("vibe-nextjs-test-12345");
            const host = sandbox.getHost(3000)
            return `http://${host}`;
        });

        return {
            url: sandboxUrl,
            title: "Fragment",
            files: result.state.data.files,
            summary: result.state.data.summary,
        };
    },
);