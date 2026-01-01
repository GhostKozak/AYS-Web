import { Modal, Form, Input, Button, Select, Switch, Row, Col } from "antd";
import { useEffect, useMemo, useState } from "react";
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
import { calculateDiffs, formatLicencePlate } from "../../../utils";
import DiffViewer from "../../common/DiffViewer";

interface TripFormValues {
  driver_full_name: string;
  driver_phone_number: string;
  company: string;
  vehicle: string;
  driver: string;
  departure_time?: string;
  arrival_time?: string;
  unload_status?: string;
  has_gps_tracking?: boolean;
  is_in_temporary_parking_lot?: boolean;
  is_trip_canceled?: boolean;
  notes?: string;
}

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (values: TripFormValues) => void;
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
            ? new Date(r.arrival_time).toLocaleString("tr-TR")
            : "-",
        // Fix: Değer yoksa "-" döndür, böylece değişiklik yok sayılır
        getNewValue: (f) =>
          f.arrival_time
            ? new Date(f.arrival_time).toLocaleString("tr-TR")
            : "-",
      },
      {
        label: t("Trips.DEPARTURE_TIME"),
        dbKey: "departure_time",
        formKey: "departure_time",
        getOldValue: (r) =>
          r.departure_time
            ? new Date(r.departure_time).toLocaleString("tr-TR")
            : "-",
        getNewValue: (f) =>
          f.departure_time
            ? new Date(f.departure_time).toLocaleString("tr-TR")
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
          r.unload_status ? t(`Common.STATUS_${r.unload_status}`) : "-",
        getNewValue: (f) =>
          f.unload_status ? t(`Common.STATUS_${f.unload_status}`) : "-",
      },
      // Boolean değerler için "-" yerine direk Hayır dönebiliriz çünkü Switch uncheck ise false'dur.
      // Ama null gelme ihtimaline karşı yine de kontrol edelim.
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
        // Notlar için özel kontrol
        getOldValue: (r) => r.notes || "-",
        getNewValue: (f) => f.notes || "-",
      },
    ]);
  }, [selectedRecord, currentValues, companies, drivers, vehicles, t]);

  const hasChanges = diffs.length > 0;

  useEffect(() => {
    if (isOpen) {
      if (selectedRecord) {
        setIsExistingDriver(true);
        const toInputDate = (iso?: string) => {
          if (!iso) return undefined;
          const d = new Date(iso);
          if (Number.isNaN(d.getTime())) return undefined;
          const pad = (n: number) => String(n).padStart(2, "0");
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
            d.getDate()
          )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        form.setFieldsValue({
          driver_full_name: selectedRecord.driver.full_name,
          driver_phone_number: selectedRecord.driver.phone_number,
          company: selectedRecord.company?._id,
          vehicle: selectedRecord.vehicle?._id,
          driver: selectedRecord.driver._id,
          departure_time: toInputDate(selectedRecord.departure_time),
          arrival_time: toInputDate(selectedRecord.arrival_time),
          unload_status: selectedRecord.unload_status,
          has_gps_tracking: selectedRecord.has_gps_tracking,
          is_in_temporary_parking_lot:
            selectedRecord.is_in_temporary_parking_lot,
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
      // Seçili sürücünün bilgilerini gizli veya salt okunur alanlara set edebiliriz
      form.setFieldsValue({
        driver_full_name: selectedDriver?.full_name,
        driver_phone_number: selectedDriver?.phone_number,
      });
    } else {
      // Yeni sürücü yazılıyorsa alanları temizle ki kullanıcı girsin
      form.setFieldsValue({ driver_full_name: value, driver_phone_number: "" });
    }
  };

  const extractId = (res: any) => {
    return (
      res?._id || res?.data?._id || res?.data || res?.data?.data?._id || res?.id
    );
  };

  const handleFinish = async (values: TripFormValues) => {
    setSubmitting(true);
    try {
      const finalValues = { ...values } as any;

      // Company
      const companyExists = companies.some((c) => c._id === values.company);
      if (!companyExists && values.company) {
        const res = await createCompany({ name: values.company } as any);
        const newId = extractId(res);
        if (newId) finalValues.company = newId;
      }

      // Vehicle
      const vehicleExists = vehicles.some((v) => v._id === values.vehicle);
      if (!vehicleExists && values.vehicle) {
        const payload = {
          licence_plate: values.vehicle,
          vehicle_type: "TRUCK",
        };
        const res = await createVehicle(payload as any);
        const newId = extractId(res);
        if (newId) finalValues.vehicle = newId;
      }

      // Driver
      if (!isExistingDriver) {
        // Yeni sürücü oluştur
        const payload = {
          full_name: values.driver_full_name,
          phone_number: values.driver_phone_number,
          company: finalValues.company,
        };
        const res = await createDriver(payload as any);
        finalValues.driver = extractId(res);
      }

      // Update form to reflect newly-created ids so UI shows selected values
      form.setFieldsValue({
        company: finalValues.company,
        vehicle: finalValues.vehicle,
        driver: finalValues.driver,
      });

      // Convert datetime-local back to ISO strings before sending
      const toISO = (val?: string) => {
        if (!val) return undefined;
        const d = new Date(val);
        if (Number.isNaN(d.getTime())) return undefined;
        return d.toISOString();
      };
      finalValues.departure_time = toISO(finalValues.departure_time);
      finalValues.arrival_time = toISO(finalValues.arrival_time);

      await onFinish(finalValues);

      // Notify parent to refresh lists if provided
      try {
        onCreated?.();
      } catch (e) {
        /* ignore */
      }
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
      width={hasChanges ? 900 : 700}
      styles={{ body: { transition: "all 0.3s ease" } }}
    >
      <Row gutter={24}>
        <Col span={hasChanges ? 12 : 24}>
          <Form
            name="tipForm"
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600, paddingBlock: 32 }}
            onFinish={handleFinish}
            autoComplete="off"
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
              >
                {companies.map((company) => (
                  <Select.Option key={company._id} value={company._id}>
                    {company.name}
                  </Select.Option>
                ))}
                {companySearch &&
                  !companies.some((c) => c.name === companySearch) && (
                    <Select.Option
                      key={`create-company-${companySearch}`}
                      value={companySearch}
                    >
                      Yeni firma oluştur: {companySearch}
                    </Select.Option>
                  )}
              </Select>
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
              >
                {vehicles.map((vehicle) => (
                  <Select.Option key={vehicle._id} value={vehicle._id}>
                    {vehicle.licence_plate}
                  </Select.Option>
                ))}
                {vehicleSearch &&
                  !vehicles.some((v) => v.licence_plate === vehicleSearch) && (
                    <Select.Option
                      key={`create-vehicle-${vehicleSearch}`}
                      value={vehicleSearch}
                    >
                      Yeni araç oluştur: {vehicleSearch}
                    </Select.Option>
                  )}
              </Select>
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
              >
                {drivers.map((driver) => (
                  <Select.Option key={driver._id} value={driver._id}>
                    {driver.full_name}
                  </Select.Option>
                ))}
                {driverSearch &&
                  !drivers.some((d) => d.full_name === driverSearch) && (
                    <Select.Option
                      key={`create-driver-${driverSearch}`}
                      value={driverSearch}
                    >
                      Yeni sürücü oluştur: {driverSearch}
                    </Select.Option>
                  )}
              </Select>
            </Form.Item>

            {/* Sürücü mevcut değilse (Yeni ekleniyorsa) bu alanları göster */}
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

            <Form.Item label={t("Trips.DEPARTURE_TIME")} name="departure_time">
              <Input type="datetime-local" />
            </Form.Item>

            <Form.Item label={t("Trips.ARRIVAL_TIME")} name="arrival_time">
              <Input type="datetime-local" />
            </Form.Item>

            <Form.Item label={t("Trips.UNLOAD_STATUS")} name="unload_status">
              <Input />
            </Form.Item>

            <Form.Item
              label={t("Trips.GPS_TRACKING")}
              name="has_gps_tracking"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label={t("Trips.TEMP_PARKING")}
              name="is_in_temporary_parking_lot"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label={t("Trips.TRIP_CANCELED")}
              name="is_trip_canceled"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item label={t("Trips.NOTES")} name="notes">
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item label={null} wrapperCol={{ offset: 8, span: 16 }}>
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
