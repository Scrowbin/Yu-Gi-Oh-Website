type BannerCardProps = {
  image: string;
  title: string;
  subtitle: string;
};

export default function Banner({
  image,
  title,
  subtitle,
}: BannerCardProps) {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-md cursor-pointer">
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-x-0 bottom-0 bg-slate-900/75 px-2 py-1.5">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-white">
            {title}
        </h2>

        <p className="text-xs text-gray-200">
            {subtitle}
        </p>
        </div>
    </div>
  );
}