import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import Image from "next/image";


const Page = () => {

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh]  2xl:py-48">
        <div className="flex items-center justify-center gap-4">
          <Image
            src="/cookdev_logo.png"
            alt="Devcook"
            width={50}
            height={50}
            className="hidden md:block"
          />
          <span className="text-2xl md:text-3xl font-bold">DevCook</span>
        </div>
        <h1 className="text-2xl md:text-5xl font-bold text-center">Cook recipe with DevCook</h1>
        <p className="text-lg mg:text-xl text-muted-foreground text-center">Create apps and website by chatting with Ai</p>
        <div className="max-w-3xl mx-auto w-full ">
          <ProjectForm />
        </div>
      </section>
      <ProjectsList />
    </div>
  )
};

export default Page;