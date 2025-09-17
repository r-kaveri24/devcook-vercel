"use client"
import { dark } from '@clerk/themes'

import { UserButton } from "@clerk/nextjs"

interface Props {
    showName?: boolean;
}

export const UserControl = ({ showName }: Props) => {
    return (
        <UserButton showName={showName}
            appearance={{
                elements: {
                    userButttonBox: "rounded-md",
                    userButtonAvatarBox: "rounded-md! size-8",
                    userButtonTrigger: "rounded-md!",
                },
                baseTheme: dark,
            }}
        />
    )
}
