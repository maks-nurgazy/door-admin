"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AnalogyContent } from "@/lib/api/questions";

const analogySchema = z.object({
    examplePair: z.object({
        id: z.number(),
        firstWord: z.string().min(1, "First word is required"),
        secondWord: z.string().min(1, "Second word is required"),
        relationship: z.string(),
    }),
    correctAnswer: z.number().min(1, "Correct answer is required"),
    options: z.array(z.object({
        id: z.number(),
        firstWord: z.string().min(1, "First word is required"),
        secondWord: z.string().min(1, "Second word is required"),
        relationship: z.string(),
    })).min(2, "At least 2 options are required"),
    relationshipType: z.string(),
});

export type AnalogyFormValues = z.infer<typeof analogySchema>;

interface AnalogyFormProps {
    content?: AnalogyContent;
    onChange: (content: AnalogyContent) => void;
}

export function AnalogyForm({ content, onChange }: AnalogyFormProps) {
    const form = useForm<AnalogyFormValues>({
        resolver: zodResolver(analogySchema),
        defaultValues: content ? {
            examplePair: content.examplePair,
            correctAnswer: content.correctAnswer,
            options: content.options,
            relationshipType: content.relationshipType,
        } : {
            examplePair: {
                id: 0,
                firstWord: "",
                secondWord: "",
                relationship: "",
            },
            correctAnswer: 1,
            options: [
                { id: 1, firstWord: "", secondWord: "", relationship: "" },
                { id: 2, firstWord: "", secondWord: "", relationship: "" },
                { id: 3, firstWord: "", secondWord: "", relationship: "" },
                { id: 4, firstWord: "", secondWord: "", relationship: "" },
            ],
            relationshipType: "",
        },
    });

    const handleSubmit = (data: AnalogyFormValues) => {
        onChange(data);
    };

    return (
        <Form {...form}>
            <div className="space-y-4">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Example Pair</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="examplePair.firstWord"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Word</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="examplePair.secondWord"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Second Word</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="examplePair.relationship"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Relationship</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Options</h3>
                    {form.watch("options").map((_, index) => (
                        <div key={index} className="space-y-2">
                            <h4 className="font-medium">Option {index + 1}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`options.${index}.firstWord`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Word</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`options.${index}.secondWord`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Second Word</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name={`options.${index}.relationship`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Relationship</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                </div>

                <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Correct Answer</FormLabel>
                            <Select
                                value={field.value?.toString()}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {form.watch("options").map((option, index) => (
                                        <SelectItem key={option.id} value={option.id.toString()}>
                                            Option {option.id}: {option.firstWord} - {option.secondWord}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="relationshipType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Relationship Type</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="button" onClick={form.handleSubmit(handleSubmit)}>Update Analogy</Button>
            </div>
        </Form>
    );
}
