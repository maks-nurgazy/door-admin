"use client";

import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {topicsApi} from "@/lib/api/topics";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

const topicSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title must be less than 50 characters"),
});

type TopicFormValues = z.infer<typeof topicSchema>;

export function TopicsHeader() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const router = useRouter();

    const form = useForm<TopicFormValues>({
        resolver: zodResolver(topicSchema),
        defaultValues: {
            title: "",
        },
    });

    const onSubmit = async (data: TopicFormValues) => {
        try {
            await topicsApi.createTopic(data);
            setIsAddDialogOpen(false);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error('Failed to create topic:', error);
        }
    };

    return (
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Topics Management</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="h-4 w-4 mr-2"/>
                        Add Topic
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Topic</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Topic Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Advanced Mathematics" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" type="button" onClick={() => {
                                    setIsAddDialogOpen(false);
                                    form.reset();
                                }}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Add Topic
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}