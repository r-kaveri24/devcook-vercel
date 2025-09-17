import CustomSignIn from '@/components/CustomSignIn';
import ParticleText from '@/components/ParticleText';

export default function SignInPage() {
    return (
        <div className="relative flex justify-center min-h-screen overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/video/9694443-hd_1920_1080_25fps.mp4" type="video/mp4" />
            </video>

            {/* Black Overlay */}
            <div className="absolute inset-0 bg-black/80 z-10"></div>

            {/* Animated Particle Text - Full Width */}
            <div className="absolute top-1/2 sm:top-32 md:top-28 lg:top-32 z-11 w-full flex justify-center px-4">
                <div className="w-full max-w-4xl">
                    <ParticleText
                        text="Devcook"
                        className="opacity-70 sm:opacity-75 md:opacity-80"
                    />
                </div>
            </div>

            {/* Sign In Component */}
            <div className="relative z-20">
                <CustomSignIn />
            </div>
        </div>
    );
}