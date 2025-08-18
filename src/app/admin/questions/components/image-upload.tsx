"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { s3Api } from "@/lib/api/s3";
import { Upload } from "lucide-react";

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    onUploading: (isUploading: boolean) => void;
}

export function ImageUpload({ value, onChange, onUploading }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            onUploading(true);

            // Generate a unique filename
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

            // Get presigned URL
            const presignedUrl = await s3Api.getPresignedUrl(fileName, file.type);

            // Upload file
            await s3Api.uploadFile(presignedUrl, file);

            // Extract the file URL from the presigned URL
            const fileUrl = presignedUrl.split('?')[0];

            // Update form
            onChange(fileUrl);
            setPreview(fileUrl);
        } catch (error) {
            console.error('Failed to upload image:', error);
        } finally {
            onUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Input
                    type="text"
                    value={value || ''}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setPreview(e.target.value);
                    }}
                    placeholder="Enter image URL or upload a file"
                />
                <div className="relative">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button type="button" variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                    </Button>
                </div>
            </div>
            {preview && (
                <div className="relative h-40 rounded-lg border overflow-hidden">
                    <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain"
                    />
                </div>
            )}
        </div>
    );
}