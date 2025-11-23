import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    className?: string;
}

export function CameraCapture({ onCapture, className }: CameraCaptureProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            onCapture(file);
        }
    };

    const clearCapture = () => {
        setPreview(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={cn("w-full", className)}>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={inputRef}
                onChange={handleFileChange}
            />

            {preview ? (
                <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden border">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        onClick={clearCapture}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        className="h-32 flex flex-col gap-2 border-dashed border-2"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Camera className="h-8 w-8 text-primary" />
                        <span>Tirar Foto</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-32 flex flex-col gap-2 border-dashed border-2"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="h-8 w-8 text-slate-500" />
                        <span>Galeria</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
