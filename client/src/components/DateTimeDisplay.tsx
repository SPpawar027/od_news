import { useDateTime } from "@/hooks/use-datetime";

export default function DateTimeDisplay() {
  const { formattedDateTime } = useDateTime();

  return (
    <div className="text-sm text-gray-600 font-inter font-normal">
      {formattedDateTime}
    </div>
  );
}
