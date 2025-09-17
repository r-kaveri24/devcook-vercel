import { openai, createAgent, createTool, createNetwork, type Tool, type Message, createState } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import z from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";
import { SANDBOX_TIMEOUT } from "./types";

interface AgentState {
    summary: string;
    files: { [path: string]: string };
};

export const codeAgentFunction = inngest.createFunction(
    { id: "code-agent" },
    { event: "code-agent/run" },
    async ({ event, step }) => {

        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("devcook-nextjs-test-2");
            await sandbox.setTimeout(SANDBOX_TIMEOUT);
            return sandbox.sandboxId;
        })

        const previousMessages = await step.run('get-previous-messages', async () => {
            const formattedMessages: Message[] = [];

            const messages = await prisma.message.findMany({
                where: {
                    projectId: event.data.projectId,
                },
                orderBy: {
                    updatedAt: "desc",
                },
                take: 5,
            });

            for (const message of messages) {
                formattedMessages.push({
                    type: "text",
                    role: message.role === "ASSISTANT" ? "assistant" : "user",
                    content: message.content,
                })
            }
            return formattedMessages.reverse();
        })
        const state = createState<AgentState>({
            summary: "",
            files: {},
        }, {
            messages: previousMessages,
        })

        const codeAgent = createAgent<AgentState>({
            name: "code-agent",
            description: "An expert coding agent",
            system: PROMPT,
            model: openai({
                model: "gpt-4.1",
                defaultParameters: {
                    temperature: 0.1,
                }
            }),
            tools: [
                createTool({
                    name: "terminal",
                    description: "Use the terminal to run the commands",
                    parameters: z.object({
                        command: z.string(),
                    }),
                    handler: async ({ command }, { step }) => {
                        return await step?.run('terminal', async () => {
                            const buffers = { stdout: "", stderr: "" };

                            try {
                                const sandbox = await getSandbox(sandboxId);;
                                const result = await sandbox.commands.run(command, {
                                    onStdout: (data: string) => {
                                        buffers.stdout += data;
                                    },
                                    onStderr: (data: string) => {
                                        buffers.stderr += data;
                                    },
                                });
                                return result.stdout
                            } catch (e) {
                                console.error(
                                    `command failed: ${e} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`,
                                );
                                return `command failed: ${e} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`;
                            }
                        });
                    }
                }),
                createTool({
                    name: "createOrUpdateFiles",
                    description: "create or update files in the sandbox",
                    parameters: z.object({
                        files: z.array(
                            z.object({
                                path: z.string(),
                                content: z.string()
                            }),
                        ),
                    }),
                    handler: async (
                        { files }, { step, network }: Tool.Options<AgentState>
                    ) => {
                        const newFiles = await step?.run('createOrUpdateFiles', async () => {
                            try {
                                const updatedFiles = network.state.data.files || {};
                                const sandbox = await getSandbox(sandboxId);
                                for (const file of files) {
                                    await sandbox.files.write(file.path, file.content);
                                    updatedFiles[file.path] = file.content;
                                }
                                return updatedFiles;
                            }
                            catch (e) {
                                return "Error: " + e;
                            }
                        });

                        if (typeof newFiles === "object") {
                            network.state.data.files = newFiles;
                        }
                    }
                }),
                createTool({
                    name: "readFiles",
                    description: "Read files from the sandbox",
                    parameters: z.object({
                        files: z.array(z.string())
                    }),
                    handler: async ({ files }, { step }) => {
                        return await step?.run("readFiles", async () => {
                            try {
                                const sandbox = await getSandbox(sandboxId);
                                const contents = [];
                                for (const file of files) {
                                    const content = await sandbox.files.read(file);
                                    contents.push({ path: file, content });
                                }
                                return JSON.stringify(contents)
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
                        if (lastAssistantMessageText.includes("<task_summary")) {
                            network.state.data.summary = lastAssistantMessageText;
                        }
                    }
                    return result;
                },
            },
        });

        const network = createNetwork<AgentState>({
            name: "codin-agent-network",
            agents: [codeAgent],
            maxIter: 15,
            defaultState: state,
            router: async ({ network }) => {
                const summary = network.state.data.summary;

                if (summary) {
                    return;
                }

                return codeAgent;
            },
        });

        const result = await network.run(event.data.value, { state });

        const fragmentTitleGenerator = createAgent({
            name: "fragment-title-generator",
            description: "A fragment title generator",
            system: FRAGMENT_TITLE_PROMPT,
            model: openai({
                model: "gpt-4o",
            }),
        })
        const responseGenerator = createAgent({
            name: "response-generator",
            description: "A response generator",
            system: RESPONSE_PROMPT,
            model: openai({
                model: "gpt-4o",
            }),
        });

        const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(result.state.data.summary);
        const { output: responseOutput } = await responseGenerator.run(result.state.data.summary);


        // changes done by the trae

        const generateFragmentTitle = () => {
            const textMessage = fragmentTitleOutput.find(msg => msg.type === "text");
            if (textMessage && textMessage.type === "text") {
                if (typeof textMessage.content === "string") {
                    return textMessage.content;
                }
                if (Array.isArray(textMessage.content)) {
                    return textMessage.content.map((txt) => txt.text).join("");
                } else {
                    return textMessage.content;
                }
            }
            return "Fragment";
        }

        const generateResponse = () => {
            const textResponse = responseOutput.find(msg => msg.type === "text");
            if (textResponse && textResponse.type === "text") {
                if (typeof textResponse.content === "string") {
                    return textResponse.content;
                }
                if (Array.isArray(textResponse.content)) {
                    return textResponse.content.map((txt) => txt.text).join("");
                } else {
                    return textResponse.content;
                }
            }
            return "Generated response";
        }
        // till here

        const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length == 0;

        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId);
            const host = sandbox.getHost(3000)
            return `https://${host}`
        });

        await step.run("save-result", async () => {
            if (isError) {
                return await prisma.message.create({
                    data: {
                        projectId: event.data.projectId,
                        content: "something went wrong. Please try again.",
                        role: "ASSISTANT",
                        type: "ERROR",
                    },
                });
            }
            return await prisma.message.create({
                data: {
                    projectId: event.data.projectId,
                    content: generateResponse(),
                    role: "ASSISTANT",
                    type: "RESULT",
                    fragment: {
                        create: {

                            sandboxUrl: sandboxUrl,
                            title: generateFragmentTitle(), // Use the helper function
                            files: result.state.data.files,
                        }
                    }
                },
            })
        })
        return {
            url: sandboxUrl,
            title: result.state.data.files,
            summary: result.state.data.summary,
        };
    },
);