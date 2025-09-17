import { Navbar } from "@/modules/home/ui/components/navbar";

interface Props {
    children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
    return (
        <main className="relative flex flex-col min-h-screen ">
            <Navbar />

            <video
                className="absolute inset-0 -z-30 h-full w-full object-cover"
                autoPlay={true}
                muted={true}
                loop={true}
                playsInline={true}
                controls={false}
                preload="metadata"
                src="/video/9694443-hd_1920_1080_25fps.mp4"
            />
            <div className="absolute inset-0 -z-25 h-full w-full bg-gray-900" />
            <div className="absolute inset-0 -z-20 h-full w-full bg-background dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)]
            bg-[radial-gradient(#dadde2_1px,transparent_1px)] [background-size:7px_7px]" />
            <div className="absolute inset-0 -z-10 h-full w-full bg-black/30" />
            <div className="flex-1 flex flex-col px-4 pb-4">

                {children}
            </div>
        </main>
    );
};

export default Layout;