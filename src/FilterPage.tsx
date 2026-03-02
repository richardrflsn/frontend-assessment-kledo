import { useEffect, useRef, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router-dom";
import { FilterDataStructure } from "./types";

interface CustomComboboxProps<T extends { id: number; name: string }> {
  name: string;
  label: string;
  data: T[];
  selected?: T | null;
  onSelect?: (item: T) => void;
  icon: string;
}

const LeftArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const DownArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6 text-gray-300"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
    />
  </svg>
);

const getSelected = <T extends { id: number }>(items: T[], id: string | null) =>
  items.find((item) => item.id.toString() === id) || null;

function CustomCombobox<T extends { id: number; name: string }>({
  name,
  label,
  data,
  selected,
  onSelect,
  icon,
}: CustomComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(selected ? selected.name : "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(selected ? selected.name : "");
  }, [selected]);

  const filtered =
    data.filter((item) => {
      return item.name.toLowerCase().includes(search?.toLowerCase() || "");
    }) || [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch(selected ? selected.name : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected]);

  return (
    <div className="mb-8" ref={wrapperRef}>
      <h2 className="mb-2 text-sm font-medium uppercase text-gray-400">
        {label}
      </h2>
      <div className="relative">
        <input type="hidden" name={name} value={selected ? selected.id : ""} />
        {icon && (
          <img
            src={icon}
            alt={`${label} icon`}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none"
          />
        )}
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={`Pilih ${label}`}
          className="w-full py-3 pl-12 pr-4 border border-gray-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
        {isOpen && (
          <ul className="absolute z-10 w-full -mt-2 bg-white border max-h-40 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-gray-400">Data tidak ditemukan</li>
            ) : (
              filtered.map((item) => (
                <li
                  key={item.id}
                  onClick={() => {
                    onSelect?.(item);
                    setSearch(item.name);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  {item.name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function FilterPage() {
  const filterData = useLoaderData<FilterDataStructure>();
  const [searchParams, setSearchParams] = useSearchParams();

  const provinceId = searchParams.get("province");
  const regencyId = searchParams.get("regency");
  const districtId = searchParams.get("district");

  const selectedProvince = getSelected(filterData.provinces, provinceId);

  const regencies = selectedProvince
    ? filterData.regencies.filter(
        (regency) => regency.province_id === selectedProvince.id,
      )
    : [];
  const selectedRegency = getSelected(regencies, regencyId);

  const districts = selectedRegency
    ? filterData.districts.filter(
        (district) => district.regency_id === selectedRegency.id,
      )
    : [];
  const selectedDistrict = getSelected(districts, districtId);

  const selections = [
    { label: "Provinsi", data: selectedProvince },
    { label: "Kota/Kabupaten", data: selectedRegency },
    { label: "Kecamatan", data: selectedDistrict },
  ];
  const activeSelections = selections.filter((s) => s.data);
  const hasSelection = activeSelections.length > 0;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-80 p-8 shadow-sm border border-gray-200 shrink-0 bg-[#F9FAFC]">
        <div className="mb-14 flex justify-center items-center gap-3">
          <img
            src="/images/globe-icon.png"
            alt="Globe Icon"
            className="w-10 h-10 p-2 bg-blue-100 rounded-full "
          />
          <h1 className="text-md font-semibold">Frontend Assessment</h1>
        </div>

        <div className="flex-row justify-center items-center">
          <div className="mb-14">
            <h3 className="mb-8 text-xs tracking-widest text-gray-400 uppercase font-semibold">
              FILTER WILAYAH
            </h3>
            <CustomCombobox
              name="province"
              label="Provinsi"
              data={filterData.provinces}
              icon="/images/map-icon.png"
              selected={selectedProvince}
              onSelect={(p) => {
                setSearchParams({ province: p.id.toString() });
              }}
            />
            <CustomCombobox
              name="regency"
              label="Kota/Kabupaten"
              data={regencies}
              icon="/images/skyscrapers-icon.png"
              selected={selectedRegency}
              onSelect={(r) => {
                setSearchParams({
                  province: selectedProvince?.id.toString() || "",
                  regency: r.id.toString(),
                });
              }}
            />
            <CustomCombobox
              name="district"
              label="Kecamatan"
              data={districts}
              icon="/images/location-icon.png"
              selected={selectedDistrict}
              onSelect={(d) =>
                setSearchParams({
                  province: selectedProvince?.id.toString() || "",
                  regency: selectedRegency?.id.toString() || "",
                  district: d.id.toString(),
                })
              }
            />
          </div>
          {hasSelection && (
            <button
              type="button"
              className="w-full h-full py-4 text-sm font-medium bg-blue-50 border border-blue-500 rounded-2xl"
              onClick={() => {
                setSearchParams({});
              }}
            >
              <img
                src="/images/clear-filters-icon.png"
                alt="Reset Icon"
                className="w-4 h-4 inline mr-2"
              />
              RESET
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#F9FAFC] flex flex-col min-h-screen">
        {/* Breadcrumb */}
        <div className="w-full px-8 py-6 bg-white border border-gray-200">
          <nav
            className="text-sm font-semibold breadcrumb"
            aria-label="breadcrumb"
          >
            <ol className="flex items-center space-x-2">
              <li className="text-gray-400">Indonesia</li>
              {activeSelections.map((selection, i) => (
                <li key={i} className="flex items-center gap-2">
                  <LeftArrowIcon />
                  <span
                    className={
                      i === activeSelections.length - 1
                        ? "text-blue-400"
                        : "text-gray-400"
                    }
                  >
                    {selection.data!.name}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Filter Output */}
        <div className="flex-1 flex flex-col justify-center items-center">
          {activeSelections.length === 0 ? (
            <h1 className="text-2xl font-semibold text-gray-500">
              Tidak ada filter yang dipilih
            </h1>
          ) : (
            activeSelections.map((selection, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-center">
                  <h3 className="mb-3 text-xs uppercase tracking-widest font-medium text-blue-400">
                    {selection.label}
                  </h3>
                  <h1
                    className={`
            ${index === 0 ? "text-6xl font-extrabold" : ""}
            ${index === 1 ? "text-5xl font-bold" : ""}
            ${index === 2 ? "text-4xl font-semibold" : ""}
          `}
                  >
                    {selection.data!.name}
                  </h1>
                </div>

                {index < activeSelections.length - 1 && (
                  <div className="my-8">
                    <DownArrowIcon />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
