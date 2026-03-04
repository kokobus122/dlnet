import Tiptap from "@/components/Tiptap";
import { authClient } from "@/lib/auth-client";
import { createServerPost } from "@/server/posts";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
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

export const Route = createFileRoute("/test/")({
  component: RouteComponent,
});

function RouteComponent() {
  const formSchema = z.object({
    title: z
      .string()
      .min(5, { message: "Hey the title is not long Enough" })
      .max(100, { message: "Hey the title is too long" }),
    price: z.number().min(5, { message: "Hey the title is not long Enough" }),
    description: z
      .string()
      .min(1, { message: "Hey the title is not long Enough" })
      .max(99999, { message: "Hey the title is too long" })
      .trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      price: 29.99,
      description: "",
    },
  });

  const { data: session } = authClient.useSession();

  const createPostMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!session?.user) {
        throw new Error("You must be logged in to create a post");
      }

      return createServerPost({
        data: {
          title: values.title,
          content: values.description,
          authorId: session.user.id,
        },
      });
    },
    onSuccess: () => {
      form.reset({
        title: "",
        price: 29.99,
        description: "",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createPostMutation.mutate(values);
  }
  return (
    <>
      <main className="p-24">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Main title for your Product"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
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
              className="my-4"
              type="submit"
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </main>
    </>
  );
}
