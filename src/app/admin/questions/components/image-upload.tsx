"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { s3Api } from "@/lib/api/s3";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    onUploading: (isUploading: boolean) => void;
}

export function ImageUpload({ value, onChange, onUploading }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [error, setError] = useState<string | null>(null);

    const testFileService = async () => {
        try {
            const fileServiceUrl = process.env.NEXT_PUBLIC_FILE_SERVICE_URL || 'http://localhost:8070';
            console.log('Testing file service at:', fileServiceUrl);
            
            const response = await fetch(`${fileServiceUrl}/actuator/health`);
            const data = await response.json();
            console.log('File service health:', data);
            
            toast({
                title: "File Service Test",
                description: `File service is running: ${response.ok ? 'OK' : 'Error'}`,
            });
        } catch (error) {
            console.error('File service test failed:', error);
            toast({
                title: "File Service Test Failed",
                description: "File service is not accessible",
                variant: "destructive",
            });
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        try {
            onUploading(true);

            // Upload file directly to MinIO via file service
            const fileUrl = await s3Api.uploadFile(file, 'comparison');

            // Update form with the returned URL
            onChange(fileUrl);
            setPreview(fileUrl);
            
            toast({
                title: "Success",
                description: "Image uploaded successfully!",
            });
        } catch (error) {
            console.error('Failed to upload image:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
            setError(errorMessage);
            
            toast({
                title: "Upload Failed",
                description: errorMessage,
                variant: "destructive",
            });
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
                        setError(null);
                    }}
                    placeholder="Enter image URL or upload a file"
                />
                <div className="flex gap-2">
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
                    <Button type="button" variant="outline" onClick={testFileService}>
                        Test Service
                    </Button>
                </div>
            </div>
            
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                </div>
            )}
            
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