import Tiptap from "@/components/Tiptap";
import { createNews } from "@/server/news";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
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

export const CreateNewsForm = () => {
  const router = useRouter();
  const formSchema = z.object({
    title: z
      .string()
      .min(5, { message: "Title has to be at least 5 characters long" })
      .max(200, { message: "Title is too long" }),
    imageCover: z
      .string()
      .optional()
      .refine((val) => !val || /^https?:\/\/.+/.test(val), {
        message: "Image cover must be a valid URL",
      }),
    content: z
      .string()
      .min(1, { message: "Content cannot be empty" })
      .max(99999, { message: "Content is too long" })
      .trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      imageCover: "",
      content: "",
    },
  });

  const createNewsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return createNews({
        data: {
          title: values.title,
          content: values.content,
          imageCover: values.imageCover,
        },
      });
    },
    onSuccess: () => {
      form.reset({
        title: "",
        imageCover: "",
        content: "",
      });
      router.navigate("/");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createNewsMutation.mutate(values);
  }

  return (
    <main className="p-24 bg-charcoal">
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
                    className="bg-forest"
                    placeholder="Title here..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageCover"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image Cover URL</FormLabel>
                <FormControl>
                  <Input
                    className="bg-forest"
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Tiptap description={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="my-4"
            type="submit"
            disabled={createNewsMutation.isPending}
          >
            {createNewsMutation.isPending ? "Submitting..." : "Create News"}
          </Button>
        </form>
      </Form>
    </main>
  );
};
