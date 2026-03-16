"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT"

export function HoverBorderGradient({
    children,
    containerClassName,
    className,
    as: Element = "div",
    duration = 1,
    clockwise = true,
    ...props
}: React.PropsWithChildren<
    {
        as?: React.ElementType
        containerClassName?: string
        className?: string
        duration?: number
        clockwise?: boolean
    } & React.HTMLAttributes<HTMLElement>
>) {
    const [hovered, setHovered] = useState<boolean>(false)
    const [direction, setDirection] = useState<Direction>("TOP")

    const rotateDirection = (currentDirection: Direction): Direction => {
        const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"]
        const currentIndex = directions.indexOf(currentDirection)
        const nextIndex = clockwise
            ? (currentIndex - 1 + directions.length) % directions.length
            : (currentIndex + 1) % directions.length
        return directions[nextIndex]
    }

    const movingMapLight: Record<Direction, string> = {
        TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 0%) 0%, rgba(0, 0, 0, 0) 100%)",
        LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 0%) 0%, rgba(0, 0, 0, 0) 100%)",
        BOTTOM:
            "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 0%) 0%, rgba(0, 0, 0, 0) 100%)",
        RIGHT:
            "radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 0%) 0%, rgba(0, 0, 0, 0) 100%)",
    }

    const movingMapDark: Record<Direction, string> = {
        TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
        LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
        BOTTOM:
            "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
        RIGHT:
            "radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    }

    const highlightDark =
        "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)"
    const highlightLight =
        "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(0, 0, 0, 0) 100%)"

    useEffect(() => {
        if (!hovered) {
            const interval = setInterval(() => {
                setDirection((prevState) => rotateDirection(prevState))
            }, duration * 1000)
            return () => clearInterval(interval)
        }
    }, [hovered])
    return (
        <Element
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                "relative flex h-full w-full flex-col flex-nowrap content-center items-center justify-center overflow-visible rounded-2xl bg-black/10 box-decoration-clone p-[1px] transition duration-500 dark:bg-white/20",
                containerClassName
            )}
            {...props}
        >
            <div
                className={cn(
                    "z-10 w-full h-full rounded-[inherit] bg-white dark:bg-black text-foreground",
                    className
                )}
            >
                {children}
            </div>
            <motion.div
                className={cn(
                    "absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit] hidden dark:block"
                )}
                style={{
                    filter: "blur(2px)",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                }}
                initial={{ background: movingMapDark[direction] }}
                animate={{
                    background: hovered
                        ? [movingMapDark[direction], highlightDark]
                        : movingMapDark[direction],
                }}
                transition={{ ease: "linear", duration: duration ?? 1 }}
            />
            <motion.div
                className={cn(
                    "absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit] block dark:hidden"
                )}
                style={{
                    filter: "blur(2px)",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                }}
                initial={{ background: movingMapLight[direction] }}
                animate={{
                    background: hovered
                        ? [movingMapLight[direction], highlightLight]
                        : movingMapLight[direction],
                }}
                transition={{ ease: "linear", duration: duration ?? 1 }}
            />
            <div className="absolute inset-[1px] z-1 flex-none rounded-[inherit] bg-white dark:bg-black" />
        </Element>
    )
}
