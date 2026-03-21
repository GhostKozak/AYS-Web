import { Modal, Form, Input, Button, Select, Switch, Row, Col, DatePicker } from "antd";
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
import { calculateDiffs, formatLicencePlate } from "../../../utils/index";
import DiffViewer from "../../common/DiffViewer";

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
  const [companySearch, setCompanySearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { createCompany } = useCompanies();
  const { createDriver } = useDrivers();
  const { createVehicle } = useVehicles();
  const [isExistingDriver, setIsExistingDriver] = useState(false);
  const { t } = useTranslation();

  const currentValues = Form.useWatch([], form);

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
          return found ? found.full_name : f.driver;
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
          const val = v ? v.licence_plate : f.vehicle;
          return val ? formatLicencePlate(val) : "-";
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
          return c ? c.name : f.company;
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

  const companyOptions = useMemo(() => {
    const existing = companies.map((c) => ({ label: c.name, value: c._id }));
    if (companySearch && !companies.some((c) => c.name === companySearch)) {
      existing.push({
        label: `Yeni firma oluştur: ${companySearch}`,
        value: companySearch,
      });
    }
    return existing;
  }, [companies, companySearch]);

  const vehicleOptions = useMemo(() => {
    const existing = vehicles.map((v) => ({
      label: v.licence_plate,
      value: v._id,
    }));
    if (
      vehicleSearch &&
      !vehicles.some((v) => v.licence_plate === vehicleSearch)
    ) {
      existing.push({
        label: `Yeni araç oluştur: ${vehicleSearch}`,
        value: vehicleSearch,
      });
    }
    return existing;
  }, [vehicles, vehicleSearch]);

  const driverOptions = useMemo(() => {
    const existing = drivers.map((d) => ({ label: d.full_name, value: d._id }));
    if (driverSearch && !drivers.some((d) => d.full_name === driverSearch)) {
      existing.push({
        label: `Yeni sürücü oluştur: ${driverSearch}`,
        value: driverSearch,
      });
    }
    return existing;
  }, [drivers, driverSearch]);

  const unloadStatusOptions = useMemo(
    () => [
      { value: "WAITING", label: t("Trips.STATUS_WAITING") },
      { value: "UNLOADING", label: t("Trips.STATUS_UNLOADING") },
      { value: "UNLOADED", label: t("Trips.STATUS_UNLOADED") },
      { value: "COMPLETED", label: t("Trips.STATUS_COMPLETED") },
      { value: "CANCELED", label: t("Trips.STATUS_CANCELED") },
      { value: "UNKNOWN", label: t("Trips.STATUS_UNKNOWN") },
    ],
    [t]
  );

  const hasChanges = diffs.length > 0;

  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
        setIsExistingDriver(true);
        const toInputDate = (iso?: string) => {
          if (!iso) return undefined;
          const d = dayjs(iso);
          return d.isValid() ? d : undefined;
        };

        form.setFieldsValue({
          driver_full_name: selectedRecord.driver.full_name,
          driver_phone_number: selectedRecord.driver.phone_number,
          company: selectedRecord.company?._id,
          vehicle: selectedRecord.vehicle?._id,
          driver: selectedRecord.driver._id,
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
        setIsExistingDriver(false);
      }
    }
  }, [isOpen, selectedRecord, form]);

  const handleDriverChange = (value: string) => {
    const driverExists = drivers.some((d) => d._id === value);
    setIsExistingDriver(driverExists);

    if (driverExists) {
      const selectedDriver = drivers.find((d) => d._id === value);
      form.setFieldsValue({
        driver_full_name: selectedDriver?.full_name,
        driver_phone_number: selectedDriver?.phone_number,
      });
    } else {
      form.setFieldsValue({ driver_full_name: value, driver_phone_number: "" });
    }
  };

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

      // Company
      const companyExists = companies.some((c) => c._id === values.company);
      if (!companyExists && values.company) {
        const res = await createCompany({ name: values.company });
        const newId = extractId(res);
        if (newId) finalValues.company = newId;
      }

      // Vehicle
      const vehicleExists = vehicles.some((v) => v._id === values.vehicle);
      if (!vehicleExists && values.vehicle) {
        const payload = {
          licence_plate: values.vehicle,
          vehicle_type: "TRUCK" as const,
        };
        const res = await createVehicle(payload);
        const newId = extractId(res);
        if (newId) finalValues.vehicle = newId;
      }

      // Driver
      if (!isExistingDriver) {
        const payload = {
          full_name: values.driver_full_name,
          phone_number: values.driver_phone_number,
          company: finalValues.company || values.company,
        };
        const res = await createDriver(payload);
        const newId = extractId(res);
        if (newId) finalValues.driver = newId;
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
    } catch (error) {
      console.error("Sefer kaydedilirken hata oluştu:", error);
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
            name="tipForm"
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
              is_trip_canceled: false
            }}
          >
            <Form.Item
              label={t("Trips.COMPANY_NAME")}
              name="company"
              rules={[{ required: true, message: t("Trips.COMPANY_REQUIRED") }]}
            >
              <Select
                placeholder={t("Trips.COMPANY_REQUIRED")}
                showSearch
                filterOption={false}
                onSearch={(val) => setCompanySearch(val)}
                notFoundContent={null}
                options={companyOptions}
              />
            </Form.Item>

            <Form.Item
              label={t("Trips.LICENSE_PLATE")}
              name="vehicle"
              rules={[{ required: true, message: t("Trips.VEHICLE_REQUIRED") }]}
            >
              <Select
                placeholder={t("Trips.VEHICLE_REQUIRED")}
                showSearch
                filterOption={false}
                onSearch={(val) => setVehicleSearch(val)}
                notFoundContent={null}
                options={vehicleOptions}
              />
            </Form.Item>

            <Form.Item
              label={t("Trips.FULL_NAME")}
              name="driver"
              rules={[{ required: true, message: t("Trips.DRIVER_REQUIRED") }]}
            >
              <Select
                placeholder={t("Trips.DRIVER_REQUIRED")}
                showSearch
                filterOption={false}
                onSearch={(val) => setDriverSearch(val)}
                notFoundContent={null}
                onChange={handleDriverChange}
                options={driverOptions}
              />
            </Form.Item>

            {!isExistingDriver && (
              <>
                <Form.Item
                  label={t("Trips.FULL_NAME")}
                  name="driver_full_name"
                  rules={[
                    { required: true, message: t("Trips.DRIVER_REQUIRED") },
                  ]}
                >
                  <Input placeholder={t("Trips.FULL_NAME")} />
                </Form.Item>

                <Form.Item
                  label={t("Trips.PHONE_NUMBER")}
                  name="driver_phone_number"
                  rules={[
                    { required: true, message: t("Trips.PHONE_REQUIRED") },
                  ]}
                >
                  <Input placeholder="05XX XXX XX XX" />
                </Form.Item>
              </>
            )}

            <Form.Item label={t("Trips.ARRIVAL_TIME")} name="arrival_time">
              <DatePicker style={{ width: '100%' }} showTime format="DD.MM.YYYY HH:mm" />
            </Form.Item>

            <Form.Item label={t("Trips.DEPARTURE_TIME")} name="departure_time">
              <DatePicker style={{ width: '100%' }} showTime format="DD.MM.YYYY HH:mm" />
            </Form.Item>

            <Form.Item label={t("Trips.UNLOAD_STATUS")} name="unload_status">
              <Select placeholder={t("Trips.UNLOAD_STATUS")} options={unloadStatusOptions} />
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
              <Col span={12}>
                <Form.Item label={t("Trips.TRIP_CANCELED")} name="is_trip_canceled" valuePropName="checked" labelCol={{ span: 16 }} wrapperCol={{ span: 8 }}>
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label={t("Trips.PARKED_AT")} name="parked_at">
              <DatePicker style={{ width: '100%' }} showTime format="DD.MM.YYYY HH:mm" />
            </Form.Item>

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
