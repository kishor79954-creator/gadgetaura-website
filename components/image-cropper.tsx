"use client"

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import getCroppedImg from '@/lib/cropImage'
import { ZoomIn, Scissors, RotateCcw } from 'lucide-react'

interface ImageCropperProps {
    imageFile: File | null
    isOpen: boolean
    onClose: () => void
    onCropComplete: (croppedFile: File) => void
}

const PRESET_RATIOS = [
    { label: 'Square (1:1)', value: 1 / 1 },
    { label: 'Portrait (4:5)', value: 4 / 5 },
    { label: 'Landscape (16:9)', value: 16 / 9 },
    { label: 'Standard (4:3)', value: 4 / 3 },
]

export function ImageCropper({ imageFile, isOpen, onClose, onCropComplete }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [aspect, setAspect] = useState(1 / 1) // Default to Square
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const [isProcessing, setIsProcessing] = useState(false)
    const isProcessingRef = React.useRef(false)

    const onCropCompleteEvent = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!imageFile || !croppedAreaPixels || isProcessingRef.current) return

        isProcessingRef.current = true
        setIsProcessing(true)
        try {
            const imageUrl = URL.createObjectURL(imageFile)
            const croppedFile = await getCroppedImg(
                imageUrl,
                croppedAreaPixels,
                rotation
            )

            if (croppedFile) {
                onCropComplete(croppedFile)
            }
        } catch (e) {
            console.error(e)
            alert("Failed to crop image.")
        } finally {
            isProcessingRef.current = false
            setIsProcessing(false)
            onClose()
        }
    }

    // Early return if no file, but keep hooks structured above
    if (!imageFile) return null

    const imageUrl = URL.createObjectURL(imageFile)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] bg-background">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-primary" />
                        Crop & Align Image
                    </DialogTitle>
                </DialogHeader>

                {/* Cropper Area */}
                <div className="relative w-full h-[50vh] bg-muted/30 rounded-lg overflow-hidden border border-border">
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteEvent}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        showGrid={true}
                    />
                </div>

                {/* Controls */}
                <div className="space-y-6 mt-4">

                    {/* Aspect Ratios */}
                    <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Aspect Ratio</span>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_RATIOS.map((ratio) => (
                                <Button
                                    key={ratio.label}
                                    type="button"
                                    variant={aspect === ratio.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setAspect(ratio.value)}
                                    className="rounded-full text-xs"
                                >
                                    {ratio.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Zoom Slider */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium flex items-center gap-1.5"><ZoomIn className="w-4 h-4" /> Zoom</span>
                                <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
                            </div>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.01}
                                onValueChange={(val) => setZoom(val[0])}
                            />
                        </div>

                        {/* Rotation Slider */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium flex items-center gap-1.5"><RotateCcw className="w-4 h-4" /> Rotation</span>
                                <span className="text-xs text-muted-foreground">{rotation}°</span>
                            </div>
                            <Slider
                                value={[rotation]}
                                min={-180}
                                max={180}
                                step={1}
                                onValueChange={(val) => setRotation(val[0])}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isProcessing}>
                        {isProcessing ? "Processing..." : "Apply Crop"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
