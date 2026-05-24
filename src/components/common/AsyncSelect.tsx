import { useState, useMemo, useRef, useEffect } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import { asyncSearch } from "../../api/asyncSearch";
import debounce from "lodash/debounce";

export interface AsyncSelectProps<T> extends Omit<SelectProps<any>, "options" | "children"> {
  moduleName: string;
  labelKey: keyof T | ((item: T) => string);
  valueKey: keyof T;
  searchKey?: string;
  defaultOptions?: any[];
  extraFilters?: Record<string, any>;
  onItemSelect?: (item: T) => void;
  creatable?: boolean;
  creatableLabel?: string | ((search: string) => string);
}

export function AsyncSelect<T>({
  moduleName,
  labelKey,
  valueKey,
  searchKey = "search",
  defaultOptions = [],
  extraFilters = {},
  onItemSelect,
  creatable,
  creatableLabel,
  onChange,
  ...props
}: AsyncSelectProps<T>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<any[]>(defaultOptions);
  const [items, setItems] = useState<T[]>([]);
  const fetchRef = useRef(0);

  const fetchOptions = useMemo(
    () =>
      debounce((searchQuery: string) => {
        fetchRef.current += 1;
        const fetchId = fetchRef.current;
        setOptions([]);
        setFetching(true);

        asyncSearch<T>(moduleName, {
          [searchKey]: searchQuery,
          limit: 20,
          ...extraFilters,
        })
          .then((res) => {
            if (fetchId !== fetchRef.current) {
              return; // ignore stale requests
            }
            setItems(res.items);
            const newOptions = res.items.map((item: any) => ({
              label: typeof labelKey === "function" ? labelKey(item) : item[labelKey],
              value: item[valueKey],
            }));

            if (creatable && searchQuery) {
              const exactMatch = res.items.some((item: any) => {
                const label = typeof labelKey === "function" ? labelKey(item) : item[labelKey];
                return String(label).toLowerCase() === searchQuery.toLowerCase();
              });
              if (!exactMatch) {
                newOptions.push({
                  label: typeof creatableLabel === "function"
                    ? creatableLabel(searchQuery)
                    : `${creatableLabel || "Create"}: ${searchQuery}`,
                  value: searchQuery,
                });
              }
            }

            setOptions(newOptions);
            setFetching(false);
          })
          .catch(() => {
            if (fetchId !== fetchRef.current) return;
            setFetching(false);
          });
      }, 500),
    [moduleName, labelKey, valueKey, searchKey, JSON.stringify(extraFilters), creatable, creatableLabel]
  );

  useEffect(() => {
    // Initial fetch to populate default options if empty
    if (defaultOptions.length === 0) {
      fetchOptions("");
    } else {
      setOptions(defaultOptions);
    }
  }, [defaultOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (value: any, option: any) => {
    if (onChange) {
      onChange(value, option);
    }
    if (onItemSelect) {
      const selectedItem = items.find((item: any) => item[valueKey] === value)
        ?? (defaultOptions as any[]).find((opt: any) => opt[valueKey] === value);
      if (selectedItem) {
        onItemSelect(selectedItem);
      }
    }
  };

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={fetchOptions}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
      onChange={handleChange}
      {...props}
    />
  );
}
