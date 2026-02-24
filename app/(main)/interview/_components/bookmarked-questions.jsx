"use client";

import { removeBookmark } from "@/actions/interview";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Bookmark, BookmarkX, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BookmarkedQuestions({ bookmarkedQuestions: initialBookmarks }) {
    const [bookmarks, setBookmarks] = useState(initialBookmarks || []);
    const [removingQuestion, setRemovingQuestion] = useState(null);

    const handleRemoveBookmark = async (questionText) => {
        setRemovingQuestion(questionText);
        try {
            const result = await removeBookmark(questionText);
            if (result.success) {
                setBookmarks(result.bookmarkedQuestions);
                toast.success("Bookmark removed!");
            }
        } catch (error) {
            toast.error(error.message || "Failed to remove bookmark");
        } finally {
            setRemovingQuestion(null);
        }
    };

    if (!bookmarks?.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="gradient-title text-3xl md:text-4xl flex items-center gap-2">
                        <Bookmark className="h-6 w-6" />
                        Bookmarked Questions
                    </CardTitle>
                    <CardDescription>
                        No bookmarked questions yet. Bookmark questions from your quiz results to review them later.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="gradient-title text-3xl md:text-4xl flex items-center gap-2">
                            <Bookmark className="h-6 w-6" />
                            Bookmarked Questions
                        </CardTitle>
                        <CardDescription>
                            {bookmarks.length} question{bookmarks.length !== 1 ? "s" : ""} saved for review
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {bookmarks.map((bq, index) => (
                        <div
                            key={index}
                            className="border rounded-lg p-4 space-y-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary">{bq.category || "Technical"}</Badge>
                                    </div>
                                    <p className="font-medium">{bq.question}</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="flex-shrink-0 text-muted-foreground hover:text-red-500"
                                            disabled={removingQuestion === bq.question}
                                        >
                                            <BookmarkX className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Remove Bookmark?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will remove the question from your bookmarked list.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRemoveBookmark(bq.question)}>
                                                Remove
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <div className="flex items-start gap-2 text-sm bg-green-500/10 p-2 rounded border border-green-500/20">
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-medium text-green-500">Answer: </span>
                                    <span>{bq.answer}</span>
                                </div>
                            </div>

                            {bq.explanation && (
                                <div className="text-sm bg-muted p-2 rounded">
                                    <p className="font-medium">Explanation:</p>
                                    <p className="text-muted-foreground">{bq.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
