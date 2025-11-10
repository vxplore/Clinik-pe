import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  TextInput,
  Button,
  Text,
  Anchor,
  Select,
  Modal,
} from "@mantine/core";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import Notification from "../../components/GlobalNotification/Notification";
import ImageUpload from "../../components/ImageUpload/ImageUpload";

const AddProvider = () => {
  const navigate = useNavigate();

  const [providerPhoto, setProviderPhoto] = useState<File | null>(null);

  const [specialityOptions, setSpecialityOptions] = useState([
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Dermatology",
    "General Medicine",
  ]);
  const [newSpeciality, setNewSpeciality] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    licenseNumber: "",
    medicalCenter: "",
    emailAddress: "",
    phoneNumber: "",
    status: "Active",
    speciality: "",
    experience: "",
    degrees: "",
    universityInstitute: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    medicalCenter: "",
    speciality: "",
    experience: "",
  });

  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({
    open: false,
    data: { success: true, message: "" },
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      phoneNumber: "",
      emailAddress: "",
      medicalCenter: "",
      speciality: "",
      experience: "",
    };

    let isValid = true;

    // Full Name validation
    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    // Medical Center validation
    if (!form.medicalCenter.trim()) {
      newErrors.medicalCenter = "Medical center is required";
      isValid = false;
    }

    // Phone Number validation
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\+?1?\s?[\d\s\-()]{10,}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format";
      isValid = false;
    }

    // Email validation
    if (!form.emailAddress.trim()) {
      newErrors.emailAddress = "Email address is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress)) {
      newErrors.emailAddress = "Invalid email format";
      isValid = false;
    }

    // Speciality validation
    if (!form.speciality.trim()) {
      newErrors.speciality = "Speciality is required";
      isValid = false;
    }

    // Experience validation
    if (!form.experience.trim()) {
      newErrors.experience = "Experience is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddSpeciality = () => {
    const trimmedSpeciality = newSpeciality.trim();
    if (trimmedSpeciality && !specialityOptions.includes(trimmedSpeciality)) {
      setSpecialityOptions([...specialityOptions, trimmedSpeciality]);
      handleChange("speciality", trimmedSpeciality);
      setNewSpeciality("");
      setIsModalOpen(false);
    }
  };

  const buildPayload = () => {
    return {
      full_name: form.fullName.trim(),
      license_number: form.licenseNumber.trim(),
      medical_center: form.medicalCenter.trim(),
      email_address: form.emailAddress.trim(),
      phone_number: form.phoneNumber.trim(),
      status: form.status,
      speciality: form.speciality.trim(),
      experience: form.experience.trim(),
      degrees: form.degrees.trim(),
      university_institute: form.universityInstitute.trim(),
      profile_image: providerPhoto ? providerPhoto.name : "",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    try {
      const payload = buildPayload();
      // TODO: Replace with actual API call
      // const response = await apis.AddProvider(payload);
      console.log("Provider payload:", payload);

      setNotif({
        open: true,
        data: { success: true, message: "Provider added successfully" },
      });

      setTimeout(() => {
        setNotif((s) => ({ ...s, open: false }));
        navigate("/providers");
      }, 1500);
    } catch (err) {
      setNotif({
        open: true,
        data: {
          success: false,
          message: err instanceof Error ? err.message : "Error adding provider",
        },
      });
    }
  };

  return (
    <div className="p-0">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />

      {/* Back Button */}
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate("/providers")}
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back to Providers
          </Text>
        </Anchor>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Add New Provider
        </h2>
        <p className="text-sm text-gray-600">
          Enter provider information to create a new record.
        </p>
      </div>

      {/* Form Card */}
      <Paper withBorder radius="md" className="p-6">
        <form onSubmit={handleSubmit}>
          {/* Image Upload Component */}
          <ImageUpload
            photo={providerPhoto}
            onPhotoChange={setProviderPhoto}
            title="Provider Photo"
            description="Upload a professional photo"
            subtitle="JPG, PNG up to 5MB"
          />

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6"></div>

          {/* Row 1: Full Name | License Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name<span className="text-red-500">*</span>
              </label>
              <TextInput
                placeholder="Enter full name"
                value={form.fullName}
                onChange={(e) =>
                  handleChange("fullName", e.currentTarget.value)
                }
                error={errors.fullName}
                classNames={{
                  input:
                    "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                }}
              />
              {errors.fullName && (
                <Text size="xs" c="red" mt={4}>
                  {errors.fullName}
                </Text>
              )}
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                License Number
              </label>
              <TextInput
                placeholder="Enter license number"
                value={form.licenseNumber}
                onChange={(e) =>
                  handleChange("licenseNumber", e.currentTarget.value)
                }
                classNames={{
                  input:
                    "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                }}
              />
            </div>
          </div>

          {/* Row 2: Medical Center | Email Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Medical Center */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Medical Center<span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="Select center"
                data={["Center 1", "Center 2", "Center 3"]}
                value={form.medicalCenter}
                onChange={(val) => handleChange("medicalCenter", val || "")}
                error={errors.medicalCenter}
                classNames={{
                  input:
                    "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                }}
                searchable
              />
              {errors.medicalCenter && (
                <Text size="xs" c="red" mt={4}>
                  {errors.medicalCenter}
                </Text>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <TextInput
                placeholder="doctor@example.com"
                value={form.emailAddress}
                onChange={(e) =>
                  handleChange("emailAddress", e.currentTarget.value)
                }
                error={errors.emailAddress}
                classNames={{
                  input:
                    "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                }}
              />
              {errors.emailAddress && (
                <Text size="xs" c="red" mt={4}>
                  {errors.emailAddress}
                </Text>
              )}
            </div>
          </div>

          {/* Row 3: Phone Number | Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <div className="w-20 flex-shrink-0">
                  <TextInput
                    value="+91"
                    disabled
                    classNames={{
                      input:
                        "text-sm px-2 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-center",
                    }}
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    placeholder="9876543210"
                    value={form.phoneNumber}
                    onChange={(e) => {
                      const value = e.currentTarget.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        handleChange("phoneNumber", value);
                      }
                    }}
                    error={errors.phoneNumber}
                    classNames={{
                      input:
                        "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                    }}
                  />
                </div>
              </div>
              {errors.phoneNumber && (
                <Text size="xs" c="red" mt={4}>
                  {errors.phoneNumber}
                </Text>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Status
              </label>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={form.status === "Active"}
                    onChange={(e) =>
                      handleChange("status", e.currentTarget.value)
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={form.status === "Inactive"}
                    onChange={(e) =>
                      handleChange("status", e.currentTarget.value)
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          {/* Row 4: Speciality | Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Speciality */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Speciality<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    placeholder="Select specialty"
                    data={specialityOptions}
                    value={form.speciality}
                    onChange={(val) => handleChange("speciality", val || "")}
                    error={errors.speciality}
                    classNames={{
                      input:
                        "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                    }}
                    searchable
                  />
                </div>
                <Button
                  variant="light"
                  color="blue"
                  onClick={() => setIsModalOpen(true)}
                  title="Add new speciality"
                  className="px-3 py-2 rounded-md"
                >
                  <IconPlus size={18} />
                </Button>
              </div>
              {errors.speciality && (
                <Text size="xs" c="red" mt={4}>
                  {errors.speciality}
                </Text>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Experience<span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="5 Year"
                data={[
                  "0-1 Year",
                  "1-3 Years",
                  "3-5 Years",
                  "5-10 Years",
                  "10+ Years",
                ]}
                value={form.experience}
                onChange={(val) => handleChange("experience", val || "")}
                error={errors.experience}
                classNames={{
                  input:
                    "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                }}
                searchable
              />
              {errors.experience && (
                <Text size="xs" c="red" mt={4}>
                  {errors.experience}
                </Text>
              )}
            </div>
          </div>

          {/* Row 5: Degrees | University/Institute */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Degrees */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Degrees<span className="text-red-500">*</span>
              </label>
              <TextInput
                placeholder="MBBS, MD (Dermatology)"
                value={form.degrees}
                onChange={(e) => handleChange("degrees", e.currentTarget.value)}
                classNames={{
                  input:
                    "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                }}
              />
            </div>

            {/* University/Institute */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                University/Institute<span className="text-red-500">*</span>
              </label>
              <TextInput
                placeholder="Enter university"
                value={form.universityInstitute}
                onChange={(e) =>
                  handleChange("universityInstitute", e.currentTarget.value)
                }
                classNames={{
                  input:
                    "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-start">
            <Button
              type="submit"
              variant="filled"
              color="blue"
              className="px-6 py-2 rounded-md"
            >
              Add Provider
            </Button>
          </div>
        </form>
      </Paper>

      {/* Modal for Adding New Speciality */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Speciality"
        centered
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Speciality Name
          </label>
          <TextInput
            placeholder="Enter speciality name"
            value={newSpeciality}
            onChange={(e) => setNewSpeciality(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddSpeciality();
              }
            }}
            classNames={{
              input:
                "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
            }}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="default"
            onClick={() => {
              setIsModalOpen(false);
              setNewSpeciality("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="blue"
            onClick={handleAddSpeciality}
            disabled={!newSpeciality.trim()}
          >
            Add Speciality
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AddProvider;
