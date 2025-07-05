

interface Props {
  value: BrandType[];
  onChange: (brands: BrandType[]) => void;
}

export interface SizeType {
  size: string;
  price: string;
}
export interface BrandType {
  brandName: string;
  sizes: SizeType[];
}

export default function BrandManager({ value, onChange }: Props) {
  const handleBrandChange = (index: number, brand: BrandType) => {
    const updated = [...value];
    updated[index] = brand;
    onChange(updated);
  };

  const addBrand = () => {
    onChange([...value, { brandName: "", sizes: [{ size: "", price: "" }] }]);
  };

  const removeBrand = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  const addSize = (brandIndex: number) => {
    const updated = [...value];
    updated[brandIndex].sizes.push({ size: "", price: "" });
    onChange(updated);
  };

  const removeSize = (brandIndex: number, sizeIndex: number) => {
    const updated = [...value];
    updated[brandIndex].sizes.splice(sizeIndex, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Brands & Sizes</h2>
      {value.map((brand, i) => (
        <div key={i} className="border rounded p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Brand name"
              className="p-2 border rounded w-full mb-2"
              value={brand.brandName}
              onChange={(e) =>
                handleBrandChange(i, { ...brand, brandName: e.target.value })
              }
            />
            <button onClick={() => removeBrand(i)} className="text-red-600 ml-2">
              ❌
            </button>
          </div>
          {brand.sizes.map((size, j) => (
            <div key={j} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Size"
                className="p-2 border rounded w-1/2"
                value={size.size}
                onChange={(e) => {
                  const updatedBrand = { ...brand };
                  updatedBrand.sizes[j].size = e.target.value;
                  handleBrandChange(i, updatedBrand);
                }}
              />
              <input
                type="number"
                placeholder="Price"
                className="p-2 border rounded w-1/2"
                value={size.price}
                onChange={(e) => {
                  const updatedBrand = { ...brand };
                  updatedBrand.sizes[j].price = e.target.value;
                  handleBrandChange(i, updatedBrand);
                }}
              />
              <button onClick={() => removeSize(i, j)}>❌</button>
            </div>
          ))}
          <button onClick={() => addSize(i)} className="text-blue-600 mt-1">
            ➕ Add Size
          </button>
        </div>
      ))}
      <button
        onClick={addBrand}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        ➕ Add Brand
      </button>
    </div>
  );
}
