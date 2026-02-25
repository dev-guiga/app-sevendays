import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export default function AvatarProfile({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <Avatar>
      <AvatarImage src={src} className={className} />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}
