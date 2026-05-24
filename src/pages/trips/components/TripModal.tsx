import { Modal, Form, Input, Button, Switch, Row, Col, DatePicker, App, Flex, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useCompanies } from "../../../hooks/useCompanies";
import { useDrivers } from "../../../hooks/useDrivers";
import { useVehicles } from "../../../hooks/useVehicles";
import {
  type CompanyType,
  type DriverType,
  type TripType,
  type VehicleType,
} from "../../../types";
import { useTranslation } from "react-i18next";
import { calculateDiffs, formatLicencePlate, formatPhoneNumber, safeErrorMessage } from "../../../utils/index";
import DiffViewer from "../../common/DiffViewer";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "../../../constants/countries";

import { Select } from "antd";
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
  is_in_temporary_parking_lot?: boolean;
  is_in_parking_lot?: boolean;
  is_trip_canceled?: boolean;
  notes?: string;
}

interface TripModalProps {
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

const TripModal = ({
  isOpen,
  onClose,
  onFinish,
  onCreated,
  selectedRecord,
  isLoading,
  companies,
  drivers,
  vehicles,
}: TripModalProps) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { createCompany } = useCompanies();
  const { createDriver } = useDrivers();
  const { createVehicle } = useVehicles();
  const [isNewDriver, setIsNewDriver] = useState(false);
  const [selectedDriverObj, setSelectedDriverObj] = useState<any | null>(null);
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
          r.arrival_time
            ? dayjs(r.arrival_time).format("DD.MM.YYYY HH:mm:ss")
            : "-",
        getNewValue: (f) =>
          f.arrival_time
            ? dayjs(f.arrival_time).format("DD.MM.YYYY HH:mm:ss")
            : "-",
      },
      {
        label: t("Trips.DEPARTURE_TIME"),
        dbKey: "departure_time",
        formKey: "departure_time",
        getOldValue: (r) =>
          r.departure_time
            ? dayjs(r.departure_time).format("DD.MM.YYYY HH:mm:ss")
            : "-",
        getNewValue: (f) =>
          f.departure_time
            ? dayjs(f.departure_time).format("DD.MM.YYYY HH:mm:ss")
            : "-",
      },
      {
        label: t("Trips.PARKED_AT"),
        dbKey: "parked_at",
        formKey: "parked_at",
        getOldValue: (r) =>
          r.parked_at
            ? dayjs(r.parked_at).format("DD.MM.YYYY HH:mm:ss")
            : "-",
        getNewValue: (f) =>
          f.parked_at
            ? dayjs(f.parked_at).format("DD.MM.YYYY HH:mm:ss")
            : "-",
      },
      {
        label: t("Trips.FULL_NAME"),
        dbKey: "driver",
        formKey: "driver",
        getOldValue: (r) => r.driver?.full_name || "-",
        getNewValue: (f) => {
          if (!f.driver) return "-";
          const found = drivers.find((d) => d._id === f.driver);
          if (found) return found.full_name;
          if (selectedRecord?.driver?._id === f.driver) return selectedRecord.driver.full_name;
          return f.driver;
        },
      },
      {
        label: t("Trips.LICENSE_PLATE"),
        dbKey: "vehicle",
        formKey: "vehicle",
        getOldValue: (r) =>
          r.vehicle?.licence_plate
            ? formatLicencePlate(r.vehicle.licence_plate)
            : "-",
        getNewValue: (f) => {
          if (!f.vehicle) return "-";
          const v = vehicles.find((v) => v._id === f.vehicle);
          if (v) return formatLicencePlate(v.licence_plate);
          if (selectedRecord?.vehicle?._id === f.vehicle) return formatLicencePlate(selectedRecord.vehicle.licence_plate);
          return f.vehicle;
        },
      },
      {
        label: t("Trips.COMPANY_NAME"),
        dbKey: "company",
        formKey: "company",
        getOldValue: (r) => r.company?.name || "-",
        getNewValue: (f) => {
          if (!f.company) return "-";
          const c = companies.find((c) => c._id === f.company);
          if (c) return c.name;
          if (selectedRecord?.company?._id === f.company) return selectedRecord.company.name;
          return f.company;
        },
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
        label: t("Trips.GPS_TRACKING"),
        key: "has_gps_tracking",
        getOldValue: (r) =>
          r.has_gps_tracking ? t("Common.YES") : t("Common.NO"),
        getNewValue: (f) =>
          f.has_gps_tracking ? t("Common.YES") : t("Common.NO"),
      },
      {
        label: t("Trips.TEMP_PARKING"),
        key: "is_in_temporary_parking_lot",
        getOldValue: (r) =>
          r.is_in_temporary_parking_lot ? t("Common.YES") : t("Common.NO"),
        getNewValue: (f) =>
          f.is_in_temporary_parking_lot ? t("Common.YES") : t("Common.NO"),
      },
      {
        label: t("Trips.IN_PARKING_LOT"),
        key: "is_in_parking_lot",
        getOldValue: (r) =>
          r.is_in_parking_lot ? t("Common.YES") : t("Common.NO"),
        getNewValue: (f) =>
          f.is_in_parking_lot ? t("Common.YES") : t("Common.NO"),
      },
      {
        label: t("Trips.TRIP_CANCELED"),
        key: "is_trip_canceled",
        getOldValue: (r) =>
          r.is_trip_canceled ? t("Common.YES") : t("Common.NO"),
        getNewValue: (f) =>
          f.is_trip_canceled ? t("Common.YES") : t("Common.NO"),
      },
      {
        key: "notes",
        label: t("Trips.NOTES"),
        getOldValue: (r) => r.notes || "-",
        getNewValue: (f) => f.notes || "-",
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

        // Split phone number into prefix and part
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
          // Legacy Turkish format check
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
          is_in_temporary_parking_lot:
            selectedRecord.is_in_temporary_parking_lot,
          is_in_parking_lot: selectedRecord.is_in_parking_lot,
          is_trip_canceled: selectedRecord.is_trip_canceled,
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
    return (
      res._id || res.id || res.data?._id || res.data?.id || res.data?.data?._id
    );
  };

  const handleFinish = async (values: TripFormValues) => {
    setSubmitting(true);
    try {
      const finalValues: any = { ...values };

      // Company — use form value first, fallback to driver's company
      if (!isNewDriver) {
        if (finalValues.company) {
          // User selected a company explicitly — keep it
        } else {
          const selectedDriver = selectedDriverObj || drivers.find((d) => d._id === values.driver) || (selectedRecord?.driver?._id === values.driver ? selectedRecord.driver : null);
          if (selectedDriver && (selectedDriver as any).company) {
            finalValues.company = typeof (selectedDriver as any).company === "string" ? (selectedDriver as any).company : (selectedDriver as any).company._id;
          }
        }
      } else {
        // Company Creation
        const companyExists = values.company && /^[0-9a-fA-F]{24}$/.test(values.company);
        if (!companyExists && values.company) {
          const res = await createCompany({ name: values.company });
          const newId = extractId(res);
          if (newId) finalValues.company = newId;
          else throw new Error("Could not create company, no ID returned.");
        }
      }

      // Vehicle
      const vehicleExists = values.vehicle && /^[0-9a-fA-F]{24}$/.test(values.vehicle);
      if (!vehicleExists && values.vehicle) {
        const payload = {
          licence_plate: values.vehicle,
          vehicle_type: "TRUCK" as const,
        };
        const res = await createVehicle(payload);
        const newId = extractId(res);
        if (newId) finalValues.vehicle = newId;
        else throw new Error("Could not create vehicle, no ID returned.");
      }

      // Driver Creation
      if (isNewDriver) {
        const country = COUNTRY_CODES.find(c => c.code === (values as any).driver_country_code);
        const prefix = country?.value || DEFAULT_COUNTRY_CODE;
        const payload = {
          full_name: values.driver_full_name,
          phone_number: `${prefix}${values.driver_phone_number}`,
          company: finalValues.company || values.company,
        };
        const res = await createDriver(payload);
        const newId = extractId(res);
        if (newId) finalValues.driver = newId;
        else throw new Error("Could not create driver, no ID returned.");
      }

      const toISO = (val?: dayjs.Dayjs | string) => {
        if (!val) return undefined;
        const d = dayjs(val);
        return d.isValid() ? d.toISOString() : undefined;
      };

      const submissionData = {
        ...finalValues,
        departure_time: toISO(finalValues.departure_time),
        arrival_time: toISO(finalValues.arrival_time),
        parked_at: toISO(finalValues.parked_at),
      };

      await onFinish(submissionData);
      onCreated?.();
    } catch (error: any) {
      message.error(safeErrorMessage(error, t("Errors.OPERATION_FAILED")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        selectedRecord ? t("Trips.EDIT_FORM_TITLE") : t("Trips.ADD_FORM_TITLE")
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={hasChanges ? 950 : 750}
      styles={{ body: { transition: "all 0.3s ease" } }}
    >
      <Row gutter={24}>
        <Col span={hasChanges ? 12 : 24}>
          <Form
            name="tripForm"
            form={form}
            layout="horizontal"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            onFinish={handleFinish}
            autoComplete="off"
            initialValues={{
              has_gps_tracking: false,
              is_in_temporary_parking_lot: false,
              is_in_parking_lot: false,
              is_trip_canceled: false,
              unload_status: "WAITING",
            }}
            onValuesChange={(changedValues) => {
              if ('driver' in changedValues) {
                const driver = drivers.find((d) => d._id === changedValues.driver);
                if (driver) {
                  setSelectedDriverObj(driver as any);
                  const driverCompany = (driver as any).company;
                  if (driverCompany) {
                    const companyId = typeof driverCompany === "string" ? driverCompany : driverCompany._id;
                    const companyName = typeof driverCompany === "string" ? undefined : driverCompany.name;
                    if (companyName) {
                      setExtraCompanyOptions(prev => {
                        if (prev.some(x => x.value === companyId)) return prev;
                        return [...prev, { label: companyName, value: companyId }];
                      });
                    }
                    form.setFieldsValue({ company: companyId });
                  }
                }
              }
              if ('is_in_parking_lot' in changedValues) {
                if (changedValues.is_in_parking_lot) {
                  form.setFieldValue("parked_at", dayjs());
                } else {
                  form.setFieldValue("parked_at", undefined);
                }
              }
            }}
          >
            <Form.Item label={t("Trips.NEW_DRIVER", { defaultValue: "Add New Driver" })} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Switch checked={isNewDriver} onChange={(checked) => setIsNewDriver(checked)} />
            </Form.Item>

            {!isNewDriver ? (
              <>
              <Form.Item
                label={t("Trips.FULL_NAME")}
                name="driver"
                rules={[{ required: true, message: t("Trips.DRIVER_REQUIRED") }]}
              >
                <AsyncSelect<DriverType>
                  moduleName="drivers"
                  labelKey={(d) => `${d.full_name} — ${formatPhoneNumber(d.phone_number)}`}
                  valueKey="_id"
                  placeholder={t("Trips.DRIVER_REQUIRED")}
                  defaultOptions={driverOptions}
                  onItemSelect={(driver) => {
                    setSelectedDriverObj(driver as any);
                    const driverCompany = (driver as any).company;
                    if (driverCompany) {
                      const companyId = typeof driverCompany === "string" ? driverCompany : driverCompany._id;
                      const companyName = typeof driverCompany === "string" ? undefined : driverCompany.name;
                      if (companyName) {
                        setExtraCompanyOptions(prev => {
                          if (prev.some(x => x.value === companyId)) return prev;
                          return [...prev, { label: companyName, value: companyId }];
                        });
                      }
                      form.setFieldsValue({ company: companyId });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item label={t("Trips.COMPANY_NAME")} name="company">
                <AsyncSelect<CompanyType>
                  moduleName="companies"
                  labelKey="name"
                  valueKey="_id"
                  placeholder={t("Trips.COMPANY_REQUIRED")}
                  defaultOptions={companyOptions}
                />
              </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  label={t("Trips.COMPANY_NAME")}
                  name="company"
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

                <Form.Item
                  label={t("Trips.FULL_NAME")}
                  name="driver_full_name"
                  rules={[
                    { required: true, message: t("Trips.DRIVER_REQUIRED") },
                  ]}
                >
                  <Input placeholder={t("Trips.FULL_NAME")} autoComplete="new-password" />
                </Form.Item>

                <Form.Item label={t("Trips.PHONE_NUMBER")}>
                  <Space.Compact>
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
                                  <span style={{ fontSize: '0.8em', color: '#999' }}>{c.code}</span>
                                </Flex>
                                <span style={{ fontWeight: 600, color: '#1677ff' }}>{c.value}</span>
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
                            const country = COUNTRY_CODES.find(c => c.code === countryCode);
                            if (country?.value === "+90") {
                              if (/^5\d{9}$/.test(value)) return Promise.resolve();
                              return Promise.reject(t("Drivers.PHONE_FORMAT_ERROR", { defaultValue: "Enter a valid number (5XXXXXXXXX)" }));
                            }
                            if (/^\d{6,14}$/.test(value)) return Promise.resolve();
                            return Promise.reject(t("Drivers.PHONE_FORMAT_ERROR", { defaultValue: "Enter a valid number" }));
                          }
                        },
                      ]}
                    >
                      <Input
                        placeholder="5XX XXX XX XX"
                        autoComplete="new-password"
                        maxLength={15}
                      />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </>
            )}

            <Form.Item
              label={t("Trips.LICENSE_PLATE")}
              name="vehicle"
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

            <Form.Item label={t("Trips.ARRIVAL_TIME")} name="arrival_time">
              <DatePicker style={{ width: '100%' }} showTime format="DD.MM.YYYY HH:mm" />
            </Form.Item>

            {/* Hidden Fields */}
            <Form.Item hidden name="departure_time">
              <Input />
            </Form.Item>
            <Form.Item hidden name="unload_status">
              <Input />
            </Form.Item>
            <Form.Item hidden name="is_trip_canceled" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={t("Trips.GPS_TRACKING")} name="has_gps_tracking" valuePropName="checked" labelCol={{ span: 16 }} wrapperCol={{ span: 8 }}>
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={t("Trips.TEMP_PARKING")} name="is_in_temporary_parking_lot" valuePropName="checked" labelCol={{ span: 16 }} wrapperCol={{ span: 8 }}>
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={t("Trips.IN_PARKING_LOT")} name="is_in_parking_lot" valuePropName="checked" labelCol={{ span: 16 }} wrapperCol={{ span: 8 }}>
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            {currentValues?.is_in_parking_lot && (
              <Form.Item label={t("Trips.PARKED_AT")} name="parked_at">
                <DatePicker style={{ width: '100%' }} showTime format="DD.MM.YYYY HH:mm" />
              </Form.Item>
            )}

            <Form.Item label={t("Trips.NOTES")} name="notes">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item label={null} wrapperCol={{ offset: 10, span: 14 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading || submitting}
              >
                {selectedRecord ? t("Common.SAVE") : t("Common.ADD")}
              </Button>
            </Form.Item>
          </Form>
        </Col>
        {hasChanges && (
          <Col span={12} className="fadeIn">
            <DiffViewer diffs={diffs} />
          </Col>
        )}
      </Row>
    </Modal>
  );
};

export default TripModal;
