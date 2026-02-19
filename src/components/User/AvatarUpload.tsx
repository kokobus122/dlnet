import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { uploadAvatar } from "@/server/user";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function AvatarUpload() {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];

      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        throw new Error("No user logged in");
      }

      const publicUrl = await uploadAvatar({
        data: { file, userId: session.user.id },
      });

      await authClient.updateUser({
        image: publicUrl,
      });

      toast("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Error uploading avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Field>
        <FieldLabel htmlFor="picture">Profile picture</FieldLabel>
        <Input
          id="picture"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <FieldDescription>Select a picture to upload.</FieldDescription>
      </Field>
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
