interface PageHeaderProps {
  product: string;
  title: string;
  description?: string;
}
export const PageHeader = ({
  product,
  title,
  description,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-[19px] font-jetbrains uppercase text-secondary">
        {product}
      </p>
      <h1 className="text-[56px] font-gt-super leading-tight">{title}</h1>
      {description && <p className="text-lg">{description}</p>}
    </div>
  );
};
