import { Modal, Form, Input, Button, Select, Switch } from "antd";
import { useEffect, useState } from "react";
import { useCompanies } from "../../../hooks/useCompanies";
import { useDrivers } from "../../../hooks/useDrivers";
import { useVehicles } from "../../../hooks/useVehicles";
import {
  type CompanyType,
  type DriverType,
  type TripType,
  type VehicleType,
} from "../../../types";

interface TripFormValues {
  inputName: string;
  inputPhone: string;
  inputCompany: string; // company _id
  inputVehicle: string; // vehicle _id
  inputDriver: string; // driver _id
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
          inputName: selectedRecord.driver.full_name,
          inputPhone: selectedRecord.driver.phone_number,
          inputCompany: selectedRecord.company?._id,
          inputVehicle: selectedRecord.vehicle?._id,
          inputDriver: selectedRecord.driver._id,
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
        inputName: selectedDriver?.full_name,
        inputPhone: selectedDriver?.phone_number,
      });
    } else {
      // Yeni sürücü yazılıyorsa alanları temizle ki kullanıcı girsin
      form.setFieldsValue({ inputName: value, inputPhone: "" });
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
      const companyExists = companies.some(
        (c) => c._id === values.inputCompany
      );
      if (!companyExists && values.inputCompany) {
        const res = await createCompany({ name: values.inputCompany } as any);
        const newId = extractId(res);
        if (newId) finalValues.inputCompany = newId;
      }

      // Vehicle
      const vehicleExists = vehicles.some((v) => v._id === values.inputVehicle);
      if (!vehicleExists && values.inputVehicle) {
        const payload = {
          licence_plate: values.inputVehicle,
          vehicle_type: "TRUCK",
        };
        const res = await createVehicle(payload as any);
        const newId = extractId(res);
        if (newId) finalValues.inputVehicle = newId;
      }

      // Driver
      if (!isExistingDriver) {
        // Yeni sürücü oluştur
        const payload = {
          full_name: values.inputName,
          phone_number: values.inputPhone,
          company: finalValues.inputCompany,
        };
        const res = await createDriver(payload as any);
        finalValues.inputDriver = extractId(res);
      }

      // Update form to reflect newly-created ids so UI shows selected values
      form.setFieldsValue({
        inputCompany: finalValues.inputCompany,
        inputVehicle: finalValues.inputVehicle,
        inputDriver: finalValues.inputDriver,
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
        selectedRecord ? "Sefer Düzenleme Formu" : "Yeni Sefer Ekleme Formu"
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
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
          label="Firma"
          name="inputCompany"
          rules={[{ required: true, message: "Lütfen bir firma seçin!" }]}
        >
          <Select
            placeholder="Firma Seçin veya yeni yazın"
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
          label="Araç"
          name="inputVehicle"
          rules={[{ required: true, message: "Lütfen bir araç seçin!" }]}
        >
          <Select
            placeholder="Araç Seçin veya plaka yazın"
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
          label="Sürücü"
          name="inputDriver"
          rules={[{ required: true, message: "Lütfen bir sürücü seçin!" }]}
        >
          <Select
            placeholder="Sürücü Seçin veya isim yazın"
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
              label="Yeni Sürücü İsmi"
              name="inputName"
              rules={[{ required: true, message: "İsim zorunludur!" }]}
            >
              <Input placeholder="Sürücü tam adı" />
            </Form.Item>

            <Form.Item
              label="Yeni Sürücü Telefonu"
              name="inputPhone"
              rules={[{ required: true, message: "Telefon zorunludur!" }]}
            >
              <Input placeholder="05XX XXX XX XX" />
            </Form.Item>
          </>
        )}

        <Form.Item label="Kalkış Tarihi" name="departure_time">
          <Input type="datetime-local" />
        </Form.Item>

        <Form.Item label="Varış Tarihi" name="arrival_time">
          <Input type="datetime-local" />
        </Form.Item>

        <Form.Item label="Boşaltma Durumu" name="unload_status">
          <Input />
        </Form.Item>

        <Form.Item
          label="GPS Takibi"
          name="has_gps_tracking"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Geçici Park Alanında"
          name="is_in_temporary_parking_lot"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Sefer İptal"
          name="is_trip_canceled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item label="Notlar" name="notes">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item label={null} wrapperCol={{ offset: 8, span: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading || submitting}
          >
            {selectedRecord ? "Değişiklikleri Kaydet" : "Ekle"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TripModal;
