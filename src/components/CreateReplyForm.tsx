import Tiptap from "@/components/Tiptap";
import type { News, Post } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import { createNewsComment, createNewsCommentReply } from "@/server/news";
import { createCommentReply, createPostComment } from "@/server/posts";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";

export const CreateReplyForm = ({
  specificThread,
  onDone,
}: {
  specificThread: Post;
  onDone: () => void;
}) => {
  const formSchema = z.object({
    content: z.string().min(1, { message: "Comment cannot be empty" }).trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      content: "",
    },
  });

  const router = useRouter();
  const { data: session } = authClient.useSession();

  const commentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!session?.user) {
        throw new Error("You must be logged in to comment");
      }

      return createPostComment({
        data: {
          postId: specificThread.id,
          authorId: session.user.id,
          content: values.content,
        },
      });
    },
    onSuccess: async () => {
      form.reset({ content: "" });
      await router.invalidate();
      onDone();
    },
  });

  const handleSubmitComment = (values: z.infer<typeof formSchema>) => {
    commentMutation.mutate(values);
  };

  return (
    <>
      {session?.user ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitComment)}
            className="mt-4 space-y-3"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tiptap
                      description={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={commentMutation.isPending}
              variant="accent"
            >
              {commentMutation.isPending ? "Posting..." : "Reply"}
            </Button>
          </form>
        </Form>
      ) : (
        <p className="text-xs text-neutral-400 mt-4">
          Log in to add a comment.
        </p>
      )}
    </>
  );
};

export const CreateCommentReplyForm = ({
  specificThread,
  parentCommentId,
  onDone,
}: {
  specificThread: Post;
  parentCommentId: number;
  onDone: () => void;
}) => {
  const formSchema = z.object({
    content: z.string().min(1, { message: "Reply cannot be empty" }).trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      content: "",
    },
  });

  const router = useRouter();
  const { data: session } = authClient.useSession();

  const commentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!session?.user) {
        throw new Error("You must be logged in to comment");
      }

      return createCommentReply({
        data: {
          postId: specificThread.id,
          parentCommentId: parentCommentId,
          authorId: session.user.id,
          content: values.content,
        },
      });
    },
    onSuccess: async () => {
      form.reset({ content: "" });
      await router.invalidate();
      onDone();
    },
  });

  const handleSubmitComment = (values: z.infer<typeof formSchema>) => {
    commentMutation.mutate(values);
  };

  return (
    <>
      {session?.user ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitComment)}
            className="mt-4 space-y-3"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tiptap
                      description={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={commentMutation.isPending}
              variant="accent"
            >
              {commentMutation.isPending ? "Posting..." : "Post comment"}
            </Button>
          </form>
        </Form>
      ) : (
        <p className="text-xs text-neutral-400 mt-4">
          Log in to add a comment.
        </p>
      )}
    </>
  );
};

export const CreateNewsReplyForm = ({
  specificNews,
  onDone,
}: {
  specificNews: News;
  onDone: () => void;
}) => {
  const formSchema = z.object({
    content: z.string().min(1, { message: "Comment cannot be empty" }).trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      content: "",
    },
  });

  const router = useRouter();
  const { data: session } = authClient.useSession();

  const commentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!session?.user) {
        throw new Error("You must be logged in to comment");
      }

      return createNewsComment({
        data: {
          newsId: specificNews.id,
          authorId: session.user.id,
          content: values.content,
        },
      });
    },
    onSuccess: async () => {
      form.reset({ content: "" });
      await router.invalidate();
      onDone();
    },
  });

  const handleSubmitComment = (values: z.infer<typeof formSchema>) => {
    commentMutation.mutate(values);
  };

  return (
    <>
      {session?.user ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitComment)}
            className="mt-4 space-y-3"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tiptap
                      description={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={commentMutation.isPending}
              variant="accent"
            >
              {commentMutation.isPending ? "Posting..." : "Reply"}
            </Button>
          </form>
        </Form>
      ) : (
        <p className="text-xs text-neutral-400 mt-4">
          Log in to add a comment.
        </p>
      )}
    </>
  );
};

export const CreateNewsCommentReplyForm = ({
  specificNews,
  parentCommentId,
  onDone,
}: {
  specificNews: News;
  parentCommentId: number;
  onDone: () => void;
}) => {
  const formSchema = z.object({
    content: z.string().min(1, { message: "Reply cannot be empty" }).trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      content: "",
    },
  });

  const router = useRouter();
  const { data: session } = authClient.useSession();

  const commentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!session?.user) {
        throw new Error("You must be logged in to comment");
      }

      return createNewsCommentReply({
        data: {
          newsId: specificNews.id,
          parentCommentId,
          authorId: session.user.id,
          content: values.content,
        },
      });
    },
    onSuccess: async () => {
      form.reset({ content: "" });
      await router.invalidate();
      onDone();
    },
  });

  const handleSubmitComment = (values: z.infer<typeof formSchema>) => {
    commentMutation.mutate(values);
  };

  return (
    <>
      {session?.user ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitComment)}
            className="mt-4 space-y-3"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tiptap
                      description={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={commentMutation.isPending}
              variant="accent"
            >
              {commentMutation.isPending ? "Posting..." : "Post comment"}
            </Button>
          </form>
        </Form>
      ) : (
        <p className="text-xs text-neutral-400 mt-4">
          Log in to add a comment.
        </p>
      )}
    </>
  );
};
