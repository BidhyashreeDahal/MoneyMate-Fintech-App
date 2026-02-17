import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  actionLabel: string;
  actionHref?: string;
  onActionClick?: () => void;
  imageSrc?: string;
  imageAlt?: string;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  imageSrc,
  imageAlt = "Illustration",
}: Props) {
  const Action = () => {
    const className =
      "inline-flex items-center justify-center h-10 rounded-md bg-emerald-600 text-white text-sm font-semibold px-4 hover:bg-emerald-700 disabled:opacity-60";

    if (actionHref) {
      return (
        <Link className={className} href={actionHref}>
          {actionLabel}
        </Link>
      );
    }

    return (
      <button className={className} type="button" onClick={onActionClick}>
        {actionLabel}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-10 text-center">
      {imageSrc && (
        <div className="mx-auto mb-5 w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/30">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={900}
            height={600}
            className="h-40 w-full object-cover"
            priority={false}
          />
        </div>
      )}

      <div className="text-sm font-semibold text-gray-900">{title}</div>
      {description && (
        <div className="text-sm text-gray-500 mt-2">{description}</div>
      )}

      <div className="mt-5">
        <Action />
      </div>
    </div>
  );
}

