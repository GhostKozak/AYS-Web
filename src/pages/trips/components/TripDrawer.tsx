import { Drawer, Form, Input, Button, Switch, Row, Col, DatePicker, Select, App, Flex, Space, Divider, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useCompanies } from "../../../hooks/useCompanies";
import { useDrivers } from "../../../hooks/useDrivers";
import { useVehicles } from "../../../hooks/useVehicles";
import {
  type CompanyType,
  type DriverType,
  type DiffConfigItem,
  type TripType,
  type VehicleType,
  USER_ROLES,
} from "../../../types";
import { useTranslation } from "react-i18next";
import { calculateDiffs, formatLicencePlate, formatPhoneNumber, safeErrorMessage } from "../../../utils/index";
import DiffViewer from "../../common/DiffViewer";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "../../../constants/countries";
import { useAuth } from "../../../hooks/useAuth";
import { AsyncSelect } from "../../../components/common/AsyncSelect";

interface TripFormValues {
  driver_full_name: string;
  driver_phone_number: string;
  company: string;
  vehicle: string;
  driver: string;
  departure_time?: dayjs.Dayjs;
  arrival_time?: dayjs.Dayjs;
  parked_at?: dayjs.Dayjs;
  unload_status?: string;
  has_gps_tracking?: boolean;
  is_in_parking_lot?: boolean;
  is_trip_canceled?: boolean;
  notes?: string;
}

interface TripDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (values: any) => void;
  onCreated?: () => void;
  selectedRecord?: TripType;
  isLoading?: boolean;
  companies: CompanyType[];
  drivers: DriverType[];
  vehicles: VehicleType[];
}

const TripDrawer = ({
  isOpen,
  onClose,
  onFinish,
  onCreated,
  selectedRecord,
  isLoading,
  companies,
  drivers,
  vehicles,
}: TripDrawerProps) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { createCompany } = useCompanies();
  const { createDriver } = useDrivers();
  const { createVehicle } = useVehicles();
  const { user } = useAuth();
  const [isNewDriver, setIsNewDriver] = useState(false);
  const [selectedDriverObj, setSelectedDriverObj] = useState<DriverType | Pick<DriverType, "_id" | "full_name" | "phone_number"> | null>(null);
  const [extraCompanyOptions, setExtraCompanyOptions] = useState<{ label: string; value: string }[]>([]);
  const { t } = useTranslation();
  const { message } = App.useApp();

  const currentValues = Form.useWatch([], form);

  const driverOptions = useMemo(() => {
    const list = drivers.map(d => ({ label: `${d.full_name} — ${formatPhoneNumber(d.phone_number)}`, value: d._id }));
    if (selectedRecord?.driver && !list.some(x => x.value === selectedRecord.driver?._id)) {
      list.push({
        label: `${selectedRecord.driver.full_name} — ${formatPhoneNumber(selectedRecord.driver.phone_number)}`,
        value: selectedRecord.driver._id,
      });
    }
    return list;
  }, [drivers, selectedRecord]);

  const companyOptions = useMemo(() => {
    const list = companies.map(c => ({ label: c.name, value: c._id }));
    if (selectedRecord?.company && !list.some(x => x.value === selectedRecord.company?._id)) {
      list.push({
        label: selectedRecord.company.name,
        value: selectedRecord.company._id,
      });
    }
    for (const extra of extraCompanyOptions) {
      if (!list.some(x => x.value === extra.value)) {
        list.push(extra);
      }
    }
    return list;
  }, [companies, selectedRecord, extraCompanyOptions]);

  const vehicleOptions = useMemo(() => {
    const list = vehicles.map(v => ({ label: formatLicencePlate(v.licence_plate), value: v._id }));
    if (selectedRecord?.vehicle && !list.some(x => x.value === selectedRecord.vehicle?._id)) {
      list.push({
        label: formatLicencePlate(selectedRecord.vehicle.licence_plate),
        value: selectedRecord.vehicle._id,
      });
    }
    return list;
  }, [vehicles, selectedRecord]);

  const diffs = useMemo(() => {
    return calculateDiffs(selectedRecord, currentValues, [
      {
        label: t("Trips.ARRIVAL_TIME"),
        dbKey: "arrival_time",
        formKey: "arrival_time",
        getOldValue: (r) =>
          r.arrival_time ? dayjs(r.arrival_time).format("DD.MM.YYYY HH:mm:ss") : "-",
        getNewValue: (f) =>
          f.arrival_time ? dayjs(f.arrival_time).format("DD.MM.YYYY HH:mm:ss") : "-",
      },
      {
        label: t("Trips.DEPARTURE_TIME"),
        dbKey: "departure_time",
        formKey: "departure_time",
        getOldValue: (r) =>
          r.departure_time ? dayjs(r.departure_time).format("DD.MM.YYYY HH:mm:ss") : "-",
        getNewValue: (f) =>
          f.departure_time ? dayjs(f.departure_time).format("DD.MM.YYYY HH:mm:ss") : "-",
      },
      {
        label: t("Trips.PARKED_AT"),
        dbKey: "parked_at",
        formKey: "parked_at",
        getOldValue: (r) =>
          r.parked_at ? dayjs(r.parked_at).format("DD.MM.YYYY HH:mm:ss") : "-",
        getNewValue: (f) =>
          f.parked_at ? dayjs(f.parked_at).format("DD.MM.YYYY HH:mm:ss") : "-",
      },
      {
        label: t("Trips.UNLOAD_STATUS"),
        key: "unload_status",
        getOldValue: (r) =>
          r.unload_status ? t(`Trips.STATUS_${r.unload_status}`) : "-",
        getNewValue: (f) =>
          f.unload_status ? t(`Trips.STATUS_${f.unload_status}`) : "-",
      },
      {
        label: t("Trips.DRIVER"),
        dbKey: "driver",
        formKey: "driver",
        getOldValue: (r) => r.driver?.full_name || "-",
        getNewValue: (f) => {
          if (!f.driver) return "-";
          const found = drivers.find((d) => d._id === f.driver);
          if (found) return found.full_name;
          if (selectedRecord?.driver?._id === f.driver) return selectedRecord?.driver?.full_name || "-";
          return f.driver;
        },
      },
      {
        label: t("Trips.PHONE_NUMBER"),
        dbKey: "driver_phone_number",
        formKey: "driver_phone_number",
        getOldValue: (r) => r.driver?.phone_number || "-",
        getNewValue: (f) => {
          if (f.driver_phone_number) {
            const country = COUNTRY_CODES.find(c => c.code === f.driver_country_code);
            const prefix = country?.value || DEFAULT_COUNTRY_CODE;
            return `${prefix}${f.driver_phone_number}`;
          }
          if (selectedRecord?.driver?.phone_number) {
            return selectedRecord.driver.phone_number;
          }
          return "-";
        },
      },
      {
        label: t("Trips.COMPANY"),
        dbKey: "company",
        formKey: "company",
        getOldValue: (r) => r.company?.name || "-",
        getNewValue: (f) => {
          if (!f.company) return "-";
          const c = companies.find((c) => c._id === f.company);
          if (c) return c.name;
          if (selectedRecord?.company?._id === f.company) return selectedRecord?.company?.name || "-";
          return f.company;
        },
      },
      {
        label: t("Trips.LICENSE_PLATE"),
        dbKey: "vehicle",
        formKey: "vehicle",
        getOldValue: (r) =>
          r.vehicle?.licence_plate ? formatLicencePlate(r.vehicle.licence_plate) : "-",
        getNewValue: (f) => {
          if (!f.vehicle) return "-";
          const v = vehicles.find((v) => v._id === f.vehicle);
          if (v) return formatLicencePlate(v.licence_plate);
          if (selectedRecord?.vehicle?._id === f.vehicle) return formatLicencePlate(selectedRecord?.vehicle?.licence_plate || "");
          return f.vehicle;
        },
      },
      {
        label: t("Trips.GPS_TRACKING"),
        key: "has_gps_tracking",
        getOldValue: (r) => r.has_gps_tracking ? t("Common.YES") : t("Common.NO"),
        getNewValue: (f) => f.has_gps_tracking ? t("Common.YES") : t("Common.NO"),
      },
      {
        label: t("Trips.IN_PARKING_LOT"),
        key: "is_in_parking_lot",
        getOldValue: (r) => r.is_in_parking_lot ? t("Common.YES") : t("Common.NO"),
        getNewValue: (f) => f.is_in_parking_lot ? t("Common.YES") : t("Common.NO"),
      },
      ...((selectedRecord?.is_in_parking_lot || currentValues?.is_in_parking_lot)
        ? [
            {
              label: t("Trips.PARKING_AREA"),
              key: "parking_area" as keyof TripType,
              getOldValue: (r: TripType) => r.parking_area || "-",
              getNewValue: (f: any) => f.parking_area || "-",
            } as DiffConfigItem<TripType, any>,
            {
              label: t("Trips.PARKING_NOTE"),
              key: "parking_note" as keyof TripType,
              getOldValue: (r: TripType) => r.parking_note || "-",
              getNewValue: (f: any) => f.parking_note || "-",
            } as DiffConfigItem<TripType, any>,
          ]
        : []),
      {
        label: t("Trips.TRIP_CANCELED"),
        key: "is_trip_canceled",
        getOldValue: (r) => r.is_trip_canceled ? t("Common.YES") : t("Common.NO"),
        getNewValue: (f) => f.is_trip_canceled ? t("Common.YES") : t("Common.NO"),
      },
      {
        key: "notes",
        label: t("Trips.NOTES"),
        getOldValue: (r) => r.notes || "-",
        getNewValue: (f) => f.notes || "-",
      },
      {
        key: "deleted",
        label: t("Common.STATUS"),
        getOldValue: (r) => r.deleted ? t("Common.PASSIVE") : t("Common.ACTIVE"),
        getNewValue: (f) => f.deleted ? t("Common.PASSIVE") : t("Common.ACTIVE"),
      },
    ]);
  }, [selectedRecord, currentValues, companies, drivers, vehicles, t]);

  const hasChanges = diffs.length > 0;

  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
        setIsNewDriver(false);
        setSelectedDriverObj(selectedRecord.driver || null);
        const toInputDate = (iso?: string) => {
          if (!iso) return undefined;
          const d = dayjs(iso);
          return d.isValid() ? d : undefined;
        };

        let prefix = DEFAULT_COUNTRY_CODE;
        let phone = selectedRecord.driver?.phone_number ?? "";

        if (phone) {
          const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.value.length - a.value.length);
          for (const c of sortedCodes) {
            if (phone.startsWith(c.value)) {
              prefix = c.value;
              phone = phone.substring(c.value.length);
              break;
            }
          }
          if (phone.startsWith("05") && phone.length === 11 && prefix === DEFAULT_COUNTRY_CODE) {
            phone = phone.substring(1);
          }
        }

        form.setFieldsValue({
          driver_full_name: selectedRecord.driver?.full_name ?? "",
          driver_phone_number: phone,
          driver_country_code: COUNTRY_CODES.find(c => c.value === prefix)?.code || "TR",
          company: selectedRecord.company?._id,
          vehicle: selectedRecord.vehicle?._id,
          driver: selectedRecord.driver?._id,
          departure_time: toInputDate(selectedRecord.departure_time),
          arrival_time: toInputDate(selectedRecord.arrival_time),
          parked_at: toInputDate(selectedRecord.parked_at),
          unload_status: selectedRecord.unload_status,
          has_gps_tracking: selectedRecord.has_gps_tracking,
          is_in_parking_lot: selectedRecord.is_in_parking_lot,
          parking_area: selectedRecord.parking_area,
          parking_note: selectedRecord.parking_note,
          is_trip_canceled: selectedRecord.is_trip_canceled,
          seal_number: selectedRecord.seal_number,
          status: selectedRecord.status,
          deleted: selectedRecord.deleted,
          notes: selectedRecord.notes,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          arrival_time: dayjs(),
          driver_country_code: "TR",
        });
        setIsNewDriver(false);
        setSelectedDriverObj(null);
        setExtraCompanyOptions([]);
      }
    }
  }, [isOpen, selectedRecord, form]);

  const extractId = (res: any): string | undefined => {
    if (typeof res === "string") return res;
    if (!res) return undefined;
    return res._id || res.id || res.data?._id || res.data?.id || res.data?.data?._id;
  };

  const handleFinish = async (values: TripFormValues) => {
    setSubmitting(true);
    try {
      const finalValues: any = { ...values };

      if (!isNewDriver) {
        if (finalValues.company) {
          // explicit selection — keep it
        } else {
          const selectedDriver =
            selectedDriverObj ||
            drivers.find((d) => d._id === values.driver) ||
            (selectedRecord?.driver?._id === values.driver ? selectedRecord.driver : null);
          if (selectedDriver && "company" in selectedDriver && selectedDriver.company) {
            const company = selectedDriver.company as any;
            if (company && company._id) finalValues.company = company._id;
          }
        }
      } else {
        const companyExists = values.company && /^[0-9a-fA-F]{24}$/.test(values.company);
        if (!companyExists && values.company) {
          const res = await createCompany({ name: values.company });
          const newId = extractId(res);
          if (newId) finalValues.company = newId;
          else throw new Error("Could not create company, no ID returned.");
        }
      }

      const vehicleExists = values.vehicle && /^[0-9a-fA-F]{24}$/.test(values.vehicle);
      if (!vehicleExists && values.vehicle) {
        const res = await createVehicle({ licence_plate: values.vehicle, vehicle_type: "TRUCK" as const });
        const newId = extractId(res);
        if (newId) finalValues.vehicle = newId;
        else throw new Error("Could not create vehicle, no ID returned.");
      }

      if (isNewDriver) {
        const country = COUNTRY_CODES.find(c => c.code === (values as any).driver_country_code);
        const prefix = country?.value || DEFAULT_COUNTRY_CODE;
        const res = await createDriver({
          full_name: values.driver_full_name,
          phone_number: `${prefix}${values.driver_phone_number}`,
          company: finalValues.company || values.company,
        });
        const newId = extractId(res);
        if (newId) finalValues.driver = newId;
        else throw new Error("Could not create driver, no ID returned.");
      }

      const toISO = (val?: dayjs.Dayjs | string) => {
        if (!val) return undefined;
        const d = dayjs(val);
        return d.isValid() ? d.toISOString() : undefined;
      };

      await onFinish({
        ...finalValues,
        departure_time: toISO(finalValues.departure_time),
        arrival_time: toISO(finalValues.arrival_time),
        parked_at: toISO(finalValues.parked_at),
      });
      onCreated?.();
    } catch (error: any) {
      message.error(safeErrorMessage(error, t("Errors.OPERATION_FAILED")));
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Ortak form içeriği (render helper) ─────────────────────────────────────
  const renderForm = () => (
    <Form
      name="tripDrawerForm"
      form={form}
      layout="horizontal"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={handleFinish}
      autoComplete="off"
      initialValues={{
        has_gps_tracking: false,
        is_in_parking_lot: false,
        is_trip_canceled: false,
        unload_status: "WAITING",
      }}
      onValuesChange={(changedValues) => {
        if ("driver" in changedValues) {
          const driver = drivers.find((d) => d._id === changedValues.driver);
          if (driver) {
            setSelectedDriverObj(driver);
            const driverCompany = driver.company;
            if (driverCompany) {
              const companyId = typeof driverCompany === "string" ? driverCompany : driverCompany._id;
              const companyName = typeof driverCompany === "string" ? undefined : driverCompany.name;
              if (companyName) {
                setExtraCompanyOptions((prev) => {
                  if (prev.some((x) => x.value === companyId)) return prev;
                  return [...prev, { label: companyName, value: companyId }];
                });
              }
              form.setFieldsValue({ company: companyId });
            }
          }
        }
        if ("is_in_parking_lot" in changedValues) {
          form.setFieldValue("parked_at", changedValues.is_in_parking_lot ? dayjs() : undefined);
        }
      }}
    >
      {/* ─── BÖLÜM 1: Sürücü Bilgileri ─── */}
      <Divider orientation="left" orientationMargin={0} style={{ marginTop: 8, marginBottom: 16 }}>
        <Flex align="center" gap={6}>
          <span style={{ fontSize: 13 }}>👤</span>
          <Typography.Text strong style={{ fontSize: 13 }}>
            {t("Trips.SECTION_DRIVER", { defaultValue: "Sürücü Bilgileri" })}
          </Typography.Text>
        </Flex>
      </Divider>

      <Form.Item label={t("Trips.NEW_DRIVER", { defaultValue: "Add New Driver" })} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Switch checked={isNewDriver} onChange={(checked) => setIsNewDriver(checked)} />
      </Form.Item>

      {!isNewDriver ? (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t("Trips.FULL_NAME")}
              name="driver"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: t("Trips.DRIVER_REQUIRED") }]}
            >
              <AsyncSelect<DriverType>
                moduleName="drivers"
                labelKey={(d) => `${d.full_name} — ${formatPhoneNumber(d.phone_number)}`}
                valueKey="_id"
                placeholder={t("Trips.DRIVER_REQUIRED")}
                defaultOptions={driverOptions}
                onItemSelect={(driver) => {
                  setSelectedDriverObj(driver);
                  const driverCompany = driver.company;
                  if (driverCompany) {
                    const companyId = typeof driverCompany === "string" ? driverCompany : driverCompany._id;
                    const companyName = typeof driverCompany === "string" ? undefined : driverCompany.name;
                    if (companyName) {
                      setExtraCompanyOptions((prev) => {
                        if (prev.some((x) => x.value === companyId)) return prev;
                        return [...prev, { label: companyName, value: companyId }];
                      });
                    }
                    form.setFieldsValue({ company: companyId });
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t("Trips.COMPANY_NAME")} name="company" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <AsyncSelect<CompanyType>
                moduleName="companies"
                labelKey="name"
                valueKey="_id"
                placeholder={t("Trips.COMPANY_REQUIRED")}
                defaultOptions={companyOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      ) : (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t("Trips.COMPANY_NAME")}
                name="company"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                rules={[{ required: true, message: t("Trips.COMPANY_REQUIRED") }]}
              >
                <AsyncSelect<CompanyType>
                  moduleName="companies"
                  labelKey="name"
                  valueKey="_id"
                  placeholder={t("Trips.COMPANY_REQUIRED")}
                  defaultOptions={companyOptions}
                  creatable
                  creatableLabel={(search) => t("Trips.CREATE_NEW_COMPANY", { name: search })}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("Trips.FULL_NAME")}
                name="driver_full_name"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                rules={[{ required: true, message: t("Trips.DRIVER_REQUIRED") }]}
              >
                <Input placeholder={t("Trips.FULL_NAME")} autoComplete="new-password" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={t("Trips.PHONE_NUMBER")} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item name="driver_country_code" noStyle>
                <Select
                  style={{ width: 90 }}
                  showSearch
                  optionFilterProp="title"
                  optionLabelProp="label"
                  styles={{ popup: { root: { minWidth: 200 } } }}
                >
                  {COUNTRY_CODES.map((c) => {
                    const translatedName = t(`Countries.${c.name}`);
                    return (
                      <Select.Option
                        key={c.code}
                        value={c.code}
                        label={c.value}
                        title={`${translatedName} ${c.value} ${c.code}`}
                      >
                        <Flex justify="space-between" align="center">
                          <Flex vertical>
                            <span style={{ fontWeight: 500 }}>{translatedName}</span>
                            <span style={{ fontSize: "0.8em", color: "#999" }}>{c.code}</span>
                          </Flex>
                          <span style={{ fontWeight: 600, color: "#1677ff" }}>{c.value}</span>
                        </Flex>
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                name="driver_phone_number"
                noStyle
                rules={[
                  { required: true, message: t("Drivers.PHONE_REQUIRED") },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const countryCode = form.getFieldValue("driver_country_code");
                      const country = COUNTRY_CODES.find((c) => c.code === countryCode);
                      if (country?.value === "+90") {
                        if (/^5\d{9}$/.test(value)) return Promise.resolve();
                        return Promise.reject(t("Drivers.PHONE_FORMAT_ERROR", { defaultValue: "Enter a valid number (5XXXXXXXXX)" }));
                      }
                      if (/^\d{6,14}$/.test(value)) return Promise.resolve();
                      return Promise.reject(t("Drivers.PHONE_FORMAT_ERROR", { defaultValue: "Enter a valid number" }));
                    },
                  },
                ]}
              >
                <Input placeholder={t("Trips.PHONE_PLACEHOLDER")} autoComplete="new-password" maxLength={15} style={{ flex: 1 }} />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
        </>
      )}

      {/* ─── BÖLÜM 2: Araç & Firma ─── */}
      <Divider orientation="left" orientationMargin={0} style={{ marginTop: 16, marginBottom: 16 }}>
        <Flex align="center" gap={6}>
          <span style={{ fontSize: 13 }}>🚛</span>
          <Typography.Text strong style={{ fontSize: 13 }}>
            {t("Trips.SECTION_VEHICLE", { defaultValue: "Araç & Firma" })}
          </Typography.Text>
        </Flex>
      </Divider>

      <Form.Item
        label={t("Trips.LICENSE_PLATE")}
        name="vehicle"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        rules={[{ required: true, message: t("Trips.VEHICLE_REQUIRED", { defaultValue: "Vehicle selection is required" }) }]}
      >
        <AsyncSelect<VehicleType>
          moduleName="vehicles"
          labelKey={(v) => formatLicencePlate(v.licence_plate)}
          valueKey="_id"
          placeholder={t("Trips.VEHICLE_REQUIRED")}
          defaultOptions={vehicleOptions}
          creatable
          creatableLabel={(search) => t("Trips.CREATE_NEW_VEHICLE", { plate: search })}
        />
      </Form.Item>

      {/* ─── BÖLÜM 3: Zaman & Durum ─── */}
      <Divider orientation="left" orientationMargin={0} style={{ marginTop: 16, marginBottom: 16 }}>
        <Flex align="center" gap={6}>
          <span style={{ fontSize: 13 }}>🕐</span>
          <Typography.Text strong style={{ fontSize: 13 }}>
            {t("Trips.SECTION_TIME", { defaultValue: "Zaman & Durum" })}
          </Typography.Text>
        </Flex>
      </Divider>

      {selectedRecord ? (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t("Trips.ARRIVAL_TIME")} name="arrival_time" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <DatePicker style={{ width: "100%" }} showTime format="DD.MM.YYYY HH:mm" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t("Trips.DEPARTURE_TIME")} name="departure_time" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <DatePicker style={{ width: "100%" }} showTime format="DD.MM.YYYY HH:mm" />
            </Form.Item>
          </Col>
        </Row>
      ) : (
        <>
          <Form.Item label={t("Trips.ARRIVAL_TIME")} name="arrival_time" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <DatePicker style={{ width: "100%" }} showTime format="DD.MM.YYYY HH:mm" />
          </Form.Item>
          <Form.Item hidden name="departure_time">
            <Input />
          </Form.Item>
        </>
      )}

      {selectedRecord ? (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t("Trips.UNLOAD_STATUS")} name="unload_status" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Select>
                <Select.Option value="WAITING">{t("Trips.STATUS_WAITING")}</Select.Option>
                <Select.Option value="UNLOADING">{t("Trips.STATUS_UNLOADING")}</Select.Option>
                <Select.Option value="UNLOADED">{t("Trips.STATUS_UNLOADED")}</Select.Option>
                <Select.Option value="COMPLETED">{t("Trips.STATUS_COMPLETED")}</Select.Option>
                <Select.Option value="CANCELED">{t("Trips.STATUS_CANCELED")}</Select.Option>
                <Select.Option value="UNKNOWN">{t("Trips.STATUS_UNKNOWN")}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t("Trips.SEAL_NUMBER")} name="seal_number" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Input maxLength={50} />
            </Form.Item>
          </Col>
        </Row>
      ) : (
        <Form.Item hidden name="unload_status">
          <Input />
        </Form.Item>
      )}

      {selectedRecord && (
        <Form.Item label={t("Trips.VERIFICATION_STATUS")} name="status" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          <Select>
            <Select.Option value="PENDING">{t("Trips.VERIFY_PENDING")}</Select.Option>
            <Select.Option value="CONFIRMED">{t("Trips.VERIFY_CONFIRMED")}</Select.Option>
            <Select.Option value="CANCELED">{t("Trips.VERIFY_CANCELED")}</Select.Option>
          </Select>
        </Form.Item>
      )}

      {/* ─── BÖLÜM 4: Ek Bilgiler ─── */}
      <Divider orientation="left" orientationMargin={0} style={{ marginTop: 16, marginBottom: 16 }}>
        <Flex align="center" gap={6}>
          <span style={{ fontSize: 13 }}>⚙️</span>
          <Typography.Text strong style={{ fontSize: 13 }}>
            {t("Trips.SECTION_EXTRA", { defaultValue: "Ek Bilgiler" })}
          </Typography.Text>
        </Flex>
      </Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t("Trips.GPS_TRACKING")} name="has_gps_tracking" valuePropName="checked" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t("Trips.IN_PARKING_LOT")} name="is_in_parking_lot" valuePropName="checked" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      {(currentValues?.is_in_parking_lot || form.getFieldValue("is_in_parking_lot")) && (
        <>
          <Form.Item label={t("Trips.PARKED_AT")} name="parked_at" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <DatePicker style={{ width: "100%" }} showTime format="DD.MM.YYYY HH:mm" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t("Trips.PARKING_AREA")} name="parking_area" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
                <Select
                  showSearch
                  allowClear
                  options={[
                    { label: t("Trips.PARKING_MURAT_GARAJ"), value: "Murat Garaj" },
                    { label: t("Trips.PARKING_MORGUL_PARK"), value: "Morgül Park" },
                    { label: t("Trips.PARKING_KORIDOR_KESIK"), value: "Koridor Kesik" },
                    { label: t("Trips.PARKING_ACIK_SAHADA"), value: "Açık Sahada" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t("Trips.PARKING_NOTE")} name="parking_note" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
                <Input placeholder={t("Trips.PARKING_NOTE_PLACEHOLDER")} />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      <Row gutter={16}>
        <Col span={12}>
          {selectedRecord ? (
            <Form.Item label={t("Trips.TRIP_CANCELED")} name="is_trip_canceled" valuePropName="checked" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
              <Switch />
            </Form.Item>
          ) : (
            <Form.Item hidden name="is_trip_canceled" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Col>
        {selectedRecord && user?.role === USER_ROLES.ADMIN && (
          <Col span={12}>
            <Form.Item label={t("Common.STATUS")} name="deleted" valuePropName="checked" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
              <Switch checkedChildren={t("Common.PASSIVE")} unCheckedChildren={t("Common.ACTIVE")} />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Form.Item label={t("Trips.NOTES")} name="notes" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Input.TextArea rows={3} />
      </Form.Item>

      {/* ─── DiffViewer (değişiklik varsa) ─── */}
      {hasChanges && (
        <div className="fadeIn" style={{ marginTop: 8 }}>
          <DiffViewer diffs={diffs} />
        </div>
      )}

      {/* ─── Footer Butonları ─── */}
      <Flex justify="flex-end" gap={8} style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--ant-color-border, #f0f0f0)" }}>
        <Button onClick={onClose}>{t("Common.CANCEL", { defaultValue: "İptal" })}</Button>
        <Button type="primary" htmlType="submit" loading={isLoading || submitting}>
          {selectedRecord ? t("Common.SAVE") : t("Common.ADD")}
        </Button>
      </Flex>
    </Form>
  );

  return (
    <Drawer
      title={selectedRecord ? t("Trips.EDIT_FORM_TITLE") : t("Trips.ADD_FORM_TITLE")}
      open={isOpen}
      onClose={onClose}
      width={720}
      destroyOnHidden
      styles={{
        body: { padding: "16px 24px", overflowY: "auto" },
        header: { borderBottom: "1px solid var(--ant-color-border, #f0f0f0)" },
      }}
      footer={null}
    >
      {renderForm()}
    </Drawer>
  );
};

export default TripDrawer;
