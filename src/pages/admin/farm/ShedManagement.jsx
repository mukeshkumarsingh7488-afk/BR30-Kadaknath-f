import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, FileSpreadsheet, FileText, ImagePlus, Pencil, Plus, RefreshCw, Search, Trash2, Upload, X, Wrench } from "lucide-react";
import apiRequest from "../../../api/api";
import { showError, showSuccess } from "../../../utils/sweetAlert";
import Swal from "sweetalert2";

const MAINTENANCE_TYPES = ["CLEANING", "SANITIZATION", "REPAIR", "ELECTRICAL", "PLUMBING", "VENTILATION", "EQUIPMENT", "STRUCTURAL", "PEST_CONTROL", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const emptyForm = {
  farm: "",
  shed: "",
  maintenanceDate: "",
  maintenanceType: "CLEANING",
  title: "",
  description: "",
  priority: "MEDIUM",
  reportedBy: "",
  assignedTo: "",
  scheduledDate: "",
  completedDate: "",
  status: "PENDING",
  estimatedCost: "",
  actualCost: "",
  vendor: { name: "", phone: "", company: "" },
  materialsUsed: [],
  beforeImages: [],
  afterImages: [],
  notes: "",
};

const getData = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.farms)) return data.farms;
  if (Array.isArray(data?.sheds)) return data.sheds;
  if (Array.isArray(data?.users)) return data.users;
  return [];
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLabel = (value) => {
  if (!value) return "-";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toInputDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const normalizeResponse = (response) => {
  if (response?.data?.success !== undefined) return response.data;
  if (response?.success !== undefined) return response;
  return null;
};

const getStatusClass = (status) => {
  if (status === "COMPLETED") return "status completed";
  if (status === "IN_PROGRESS") return "status progress";
  if (status === "CANCELLED") return "status cancelled";
  return "status pending";
};

const getPriorityClass = (priority) => {
  if (priority === "URGENT") return "priority urgent";
  if (priority === "HIGH") return "priority high";
  if (priority === "LOW") return "priority low";
  return "priority medium";
};

const escapeCsv = (value) => {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default function ShedManagement() {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState("");
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [farmFilter, setFarmFilter] = useState("");
  const [shedFilter, setShedFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(emptyForm);

  const beforeImageInputRef = useRef(null);
  const afterImageInputRef = useRef(null);

  const filteredSheds = useMemo(() => {
    if (!form.farm) return sheds;

    return sheds.filter((shed) => {
      const farmId = shed?.farm?._id || shed?.farm;
      return String(farmId) === String(form.farm);
    });
  }, [sheds, form.farm]);

  const filterSheds = useMemo(() => {
    if (!farmFilter) return sheds;

    return sheds.filter((shed) => {
      const farmId = shed?.farm?._id || shed?.farm;
      return String(farmId) === String(farmFilter);
    });
  }, [sheds, farmFilter]);

  const staffUsers = useMemo(() => {
    return users.filter((user) => (user?._id || user?.id) && ["staff", "admin"].includes(String(user?.role || "").toLowerCase()) && !user?.isBlocked);
  }, [users]);

  const stats = useMemo(() => {
    const pending = records.filter((item) => item.status === "PENDING").length;
    const progress = records.filter((item) => item.status === "IN_PROGRESS").length;
    const completed = records.filter((item) => item.status === "COMPLETED").length;
    const cancelled = records.filter((item) => item.status === "CANCELLED").length;
    const estimated = records.reduce((sum, item) => sum + Number(item.estimatedCost || 0), 0);
    const actual = records.reduce((sum, item) => sum + Number(item.actualCost || 0), 0);

    return {
      pending,
      progress,
      completed,
      cancelled,
      estimated,
      actual,
    };
  }, [records]);

  const loadOptions = async () => {
    setLoadingOptions(true);

    try {
      const [farmResponse, shedResponse, userResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/sheds"), apiRequest("/admin/users/staff")]);

      console.log("========== FARM DEBUG ==========");
      console.log("FARM RESPONSE:", farmResponse);
      console.log("FARM RESPONSE DATA:", farmResponse?.data);

      console.log("========== SHED DEBUG ==========");
      console.log("SHED RESPONSE:", shedResponse);
      console.log("SHED RESPONSE DATA:", shedResponse?.data);

      console.log("========== STAFF DEBUG ==========");
      console.log("STAFF RESPONSE:", userResponse);
      console.log("STAFF RESPONSE DATA:", userResponse?.data);

      const farmData = farmResponse?.data?.farms || farmResponse?.farms || farmResponse?.data?.data || [];

      const shedData = shedResponse?.data?.sheds || shedResponse?.sheds || shedResponse?.data?.data || [];

      const userData = userResponse?.data?.staff || userResponse?.staff || userResponse?.data?.users || userResponse?.users || userResponse?.data?.data || [];

      console.log("FINAL FARM DATA:", farmData);
      console.log("FINAL SHED DATA:", shedData);
      console.log("FINAL STAFF DATA:", userData);

      setFarms(Array.isArray(farmData) ? farmData : []);
      setSheds(Array.isArray(shedData) ? shedData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error("LOAD FARM OPTIONS ERROR:", err);

      showError(err?.response?.data?.message || err?.message || "Farm, shed ya staff data load nahi ho pa raha hai.");
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "20");

      if (farmFilter) params.set("farm", farmFilter);
      if (shedFilter) params.set("shed", shedFilter);
      if (typeFilter) params.set("maintenanceType", typeFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);

      const response = await apiRequest(`/shed-maintenance?${params.toString()}`);
      const payload = normalizeResponse(response);

      if (payload?.success === false) {
        throw new Error(payload.message || "Maintenance records load nahi ho sake");
      }

      const data = payload?.data || getData(response);

      setRecords(Array.isArray(data) ? data : []);

      setTotal(Number(payload?.total ?? response?.data?.total ?? data?.length ?? 0));

      setTotalPages(Math.max(1, Number(payload?.totalPages ?? response?.data?.totalPages ?? 1)));
    } catch (err) {
      setRecords([]);
      setTotal(0);
      setTotalPages(1);

      setError(err?.response?.data?.message || err?.message || "Maintenance records load nahi ho sake");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [page, farmFilter, shedFilter, typeFilter, priorityFilter, statusFilter, fromDate, toDate]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages]);

  const resetFilters = () => {
    setSearch("");
    setFarmFilter("");
    setShedFilter("");
    setTypeFilter("");
    setPriorityFilter("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateVendor = (field, value) => {
    setForm((prev) => ({
      ...prev,
      vendor: {
        ...prev.vendor,
        [field]: value,
      },
    }));
  };

  const addMaterial = () => {
    if (form.materialsUsed.length >= 100) {
      showError("Maximum 100 materials allowed");
      return;
    }

    setForm((prev) => ({
      ...prev,
      materialsUsed: [
        ...prev.materialsUsed,
        {
          name: "",
          quantity: "",
          unit: "",
          cost: "",
        },
      ],
    }));
  };

  const updateMaterial = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      materialsUsed: prev.materialsUsed.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const removeMaterial = (index) => {
    setForm((prev) => ({
      ...prev,
      materialsUsed: prev.materialsUsed.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addImage = (type) => {
    if (form[type].length >= 20) {
      showError("Maximum 20 images allowed");
      return;
    }

    setForm((prev) => ({
      ...prev,
      [type]: [
        ...prev[type],
        {
          url: "",
          publicId: "",
        },
      ],
    }));
  };

  const updateImage = (type, index, field, value) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const removeImage = (type, index) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const uploadImage = async (type, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Sirf image file upload kar sakte hain");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Image size maximum 5 MB ho sakta hai");
      return;
    }

    if (form[type].length >= 20) {
      showError("Maximum 20 images allowed");
      return;
    }

    const uploadKey = type;

    setUploadingImage(uploadKey);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiRequest("/shed-maintenance/upload-image", {
        method: "POST",
        body: formData,
      });

      const payload = normalizeResponse(response);
      const uploadedImage = payload?.data;

      if (payload?.success === false) {
        throw new Error(payload.message || "Image upload failed");
      }

      if (!uploadedImage?.url) {
        throw new Error("Cloudinary upload response me image URL nahi mila");
      }

      setForm((prev) => ({
        ...prev,
        [type]: [
          ...prev[type],
          {
            url: uploadedImage.url,
            publicId: uploadedImage.publicId || "",
          },
        ],
      }));

      showSuccess(type === "beforeImages" ? "Before image uploaded successfully" : "After image uploaded successfully");
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Image upload nahi ho saka");
    } finally {
      setUploadingImage("");
    }
  };

  const handleImageInput = async (event, type) => {
    const file = event.target.files?.[0];

    if (file) {
      await uploadImage(type, file);
    }

    event.target.value = "";
  };

  const openCreate = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      maintenanceDate: new Date().toISOString().slice(0, 10),
      reportedBy: staffUsers[0]?._id ? String(staffUsers[0]._id) : staffUsers[0]?.id ? String(staffUsers[0].id) : "",
    });

    setModal("form");
  };

  const openEdit = (record) => {
    setEditingId(record._id);

    setForm({
      farm: record?.farm?._id || record?.farm || "",
      shed: record?.shed?._id || record?.shed || "",
      maintenanceDate: toInputDate(record.maintenanceDate),
      maintenanceType: record.maintenanceType || "CLEANING",
      title: record.title || "",
      description: record.description || "",
      priority: record.priority || "MEDIUM",
      reportedBy: record?.reportedBy?._id || record?.reportedBy || "",
      assignedTo: record?.assignedTo?._id || record?.assignedTo || "",
      scheduledDate: toInputDateTime(record.scheduledDate),
      completedDate: toInputDateTime(record.completedDate),
      status: record.status || "PENDING",
      estimatedCost: record.estimatedCost ?? "",
      actualCost: record.actualCost ?? "",
      vendor: {
        name: record?.vendor?.name || "",
        phone: record?.vendor?.phone || "",
        company: record?.vendor?.company || "",
      },
      materialsUsed: Array.isArray(record.materialsUsed)
        ? record.materialsUsed.map((item) => ({
            name: item?.name || "",
            quantity: item?.quantity ?? "",
            unit: item?.unit || "",
            cost: item?.cost ?? "",
          }))
        : [],
      beforeImages: Array.isArray(record.beforeImages)
        ? record.beforeImages.map((item) => ({
            url: item?.url || "",
            publicId: item?.publicId || "",
          }))
        : [],
      afterImages: Array.isArray(record.afterImages)
        ? record.afterImages.map((item) => ({
            url: item?.url || "",
            publicId: item?.publicId || "",
          }))
        : [],
      notes: record.notes || "",
    });

    setModal("form");
  };

  const openView = async (record) => {
    try {
      const response = await apiRequest(`/shed-maintenance/${record._id}`);

      const payload = normalizeResponse(response);

      setSelectedRecord(payload?.data || record);
    } catch {
      setSelectedRecord(record);
    }

    setModal("view");
  };

  const validateForm = () => {
    if (!form.farm) return "Farm select karein";
    if (!form.shed) return "Shed select karein";
    if (!form.maintenanceDate) return "Maintenance date required hai";
    if (!form.maintenanceType) return "Maintenance type select karein";
    if (!form.title.trim()) return "Maintenance title required hai";

    if (form.title.trim().length > 200) {
      return "Title 200 characters se zyada nahi ho sakta";
    }

    if (form.description.length > 2000) {
      return "Description 2000 characters se zyada nahi ho sakta";
    }

    if (!form.reportedBy) {
      return "Reported by user select karein";
    }

    if (!/^[0-9a-fA-F]{24}$/.test(String(form.reportedBy))) {
      return "Reported By mein valid staff/admin user select karein";
    }

    if (form.notes.length > 2000) {
      return "Notes 2000 characters se zyada nahi ho sakta";
    }

    if (Number(form.estimatedCost || 0) < 0) {
      return "Estimated cost negative nahi ho sakta";
    }

    if (Number(form.actualCost || 0) < 0) {
      return "Actual cost negative nahi ho sakta";
    }

    if (form.status === "COMPLETED" && !form.completedDate) {
      return "Completed status ke liye completed date required hai";
    }

    if (form.status === "CANCELLED" && form.completedDate) {
      return "Cancelled maintenance me completed date nahi ho sakti";
    }

    if (form.scheduledDate && form.completedDate && new Date(form.completedDate) < new Date(form.scheduledDate)) {
      return "Completed date scheduled date se pehle nahi ho sakti";
    }

    for (const material of form.materialsUsed) {
      if (Number(material.quantity || 0) < 0) {
        return "Material quantity negative nahi ho sakti";
      }

      if (Number(material.cost || 0) < 0) {
        return "Material cost negative nahi ho sakta";
      }
    }

    for (const image of [...form.beforeImages, ...form.afterImages]) {
      if (!image.url.trim()) {
        return "Image URL empty nahi ho sakta";
      }
    }

    return null;
  };

  const buildPayload = () => ({
    farm: form.farm,
    shed: form.shed,
    maintenanceDate: form.maintenanceDate,
    maintenanceType: form.maintenanceType,
    title: form.title.trim(),
    description: form.description.trim(),
    priority: form.priority,
    reportedBy: form.reportedBy ? String(form.reportedBy) : undefined,
    assignedTo: form.assignedTo ? String(form.assignedTo) : null,
    scheduledDate: form.scheduledDate || null,
    completedDate: form.completedDate || null,
    status: form.status,
    estimatedCost: Number(form.estimatedCost || 0),
    actualCost: Number(form.actualCost || 0),
    vendor: {
      name: form.vendor.name.trim(),
      phone: form.vendor.phone.trim(),
      company: form.vendor.company.trim(),
    },
    materialsUsed: form.materialsUsed.map((item) => ({
      name: String(item.name || "").trim(),
      quantity: item.quantity === "" ? 0 : Number(item.quantity),
      unit: String(item.unit || "").trim(),
      cost: item.cost === "" ? 0 : Number(item.cost),
    })),
    beforeImages: form.beforeImages
      .filter((item) => item.url.trim())
      .map((item) => ({
        url: item.url.trim(),
        ...(item.publicId?.trim()
          ? {
              publicId: item.publicId.trim(),
            }
          : {}),
      })),
    afterImages: form.afterImages
      .filter((item) => item.url.trim())
      .map((item) => ({
        url: item.url.trim(),
        ...(item.publicId?.trim()
          ? {
              publicId: item.publicId.trim(),
            }
          : {}),
      })),
    notes: form.notes.trim(),
  });

  const saveRecord = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      console.log("========== MAINTENANCE SUBMIT ==========");
      console.log("REPORTED BY:", payload.reportedBy);
      console.log("STAFF USERS:", staffUsers);
      console.log("FULL PAYLOAD:", payload);

      const response = editingId
        ? await apiRequest(`/shed-maintenance/${editingId}`, {
            method: "PUT",
            body: payload,
          })
        : await apiRequest("/shed-maintenance", {
            method: "POST",
            body: payload,
          });

      const result = normalizeResponse(response);

      if (result?.success === false) {
        throw new Error(result.message || "Save failed");
      }

      showSuccess(result?.message || (editingId ? "Maintenance updated successfully" : "Maintenance created successfully"));

      setModal(null);
      setEditingId(null);
      setForm(emptyForm);

      await loadRecords();
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Maintenance save nahi ho saka");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (record) => {
    const result = await Swal.fire({
      title: "Delete maintenance?",
      text: `${record.title || "This maintenance record"} permanently delete ho jayega.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiRequest(`/shed-maintenance/${record._id}`, {
        method: "DELETE",
      });

      const payload = normalizeResponse(response);

      if (payload?.success === false) {
        throw new Error(payload.message || "Delete failed");
      }

      showSuccess(payload?.message || "Maintenance deleted successfully");

      await loadRecords();
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || "Maintenance delete nahi ho saka");
    }
  };

  const searchedRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) => {
      const values = [record.title, record.description, record.maintenanceType, record.priority, record.status, record?.farm?.name, record?.farm?.code, record?.shed?.name, record?.shed?.code, record?.reportedBy?.name, record?.assignedTo?.name, record?.vendor?.name, record?.vendor?.company];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [records, search]);

  const exportExcel = () => {
    if (!searchedRecords.length) {
      showError("Export karne ke liye maintenance data available nahi hai");
      return;
    }

    const headers = ["Maintenance Title", "Farm", "Shed", "Maintenance Type", "Priority", "Maintenance Date", "Scheduled Date", "Completed Date", "Status", "Estimated Cost", "Actual Cost", "Reported By", "Assigned To", "Vendor Name", "Vendor Company", "Vendor Phone", "Description", "Notes"];

    const rows = searchedRecords.map((record) => [
      record?.title || "",
      record?.farm?.name || "",
      record?.shed?.name || "",
      formatLabel(record?.maintenanceType),
      formatLabel(record?.priority),
      formatDate(record?.maintenanceDate),
      formatDateTime(record?.scheduledDate),
      formatDateTime(record?.completedDate),
      formatLabel(record?.status),
      Number(record?.estimatedCost || 0),
      Number(record?.actualCost || 0),
      record?.reportedBy?.name || "",
      record?.assignedTo?.name || "Unassigned",
      record?.vendor?.name || "",
      record?.vendor?.company || "",
      record?.vendor?.phone || "",
      record?.description || "",
      record?.notes || "",
    ]);

    const csv = [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `shed-maintenance-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showSuccess("Excel file exported successfully");
  };

  const exportPdf = () => {
    if (!searchedRecords.length) {
      showError("Export karne ke liye maintenance data available nahi hai");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1400,height=900");

    if (!printWindow) {
      showError("PDF window open nahi ho saki. Browser popup allow karein.");
      return;
    }

    const generatedAt = formatDateTime(new Date());

    const rows = searchedRecords
      .map(
        (record) => `
          <tr>
            <td>
              <strong>${escapeHtml(record?.title || "-")}</strong>
              <div class="sub">${escapeHtml(record?.description || "")}</div>
            </td>
            <td>
              ${escapeHtml(record?.farm?.name || "-")}
              <div class="sub">${escapeHtml(record?.shed?.name || "-")}</div>
            </td>
            <td>${escapeHtml(formatLabel(record?.maintenanceType))}</td>
            <td>${escapeHtml(formatLabel(record?.priority))}</td>
            <td>${escapeHtml(formatDate(record?.maintenanceDate))}</td>
            <td>${escapeHtml(formatLabel(record?.status))}</td>
            <td>₹${Number(record?.actualCost || 0).toLocaleString("en-IN")}</td>
            <td>${escapeHtml(record?.assignedTo?.name || "Unassigned")}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BR30 Kadaknath Farms - Shed Maintenance Report</title>
          <meta charset="UTF-8" />
          <style>
            *{box-sizing:border-box}
            body{font-family:Arial,Helvetica,sans-serif;margin:0;padding:28px;color:#1f2937;background:#fff}
            .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:16px;margin-bottom:20px}
            h1{margin:0 0 5px;font-size:24px;color:#166534}
            .subtitle{font-size:13px;color:#6b7280}
            .meta{text-align:right;font-size:12px;color:#6b7280}
            table{width:100%;border-collapse:collapse;font-size:11px}
            th,td{border:1px solid #d1d5db;padding:8px;text-align:left;vertical-align:top}
            th{background:#f3f4f6;color:#374151;font-size:10px;text-transform:uppercase}
            .sub{margin-top:3px;color:#6b7280;font-size:9px}
            .summary{display:flex;gap:20px;margin-bottom:18px}
            .summary-item{border:1px solid #d1d5db;border-radius:8px;padding:9px 13px}
            .summary-item span{display:block;color:#6b7280;font-size:10px}
            .summary-item strong{display:block;margin-top:3px;font-size:14px}
            .footer{margin-top:20px;font-size:10px;color:#6b7280;text-align:center}
            @media print{
              body{padding:12px}
              .no-print{display:none}
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>BR30 Kadaknath Farms</h1>
              <div class="subtitle">Shed Maintenance Report</div>
            </div>
            <div class="meta">
              Generated: ${escapeHtml(generatedAt)}<br />
              Records: ${searchedRecords.length}
            </div>
          </div>

          <div class="summary">
            <div class="summary-item">
              <span>Total Records</span>
              <strong>${searchedRecords.length}</strong>
            </div>
            <div class="summary-item">
              <span>Estimated Cost</span>
              <strong>₹${stats.estimated.toLocaleString("en-IN")}</strong>
            </div>
            <div class="summary-item">
              <span>Actual Cost</span>
              <strong>₹${stats.actual.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Maintenance</th>
                <th>Farm / Shed</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actual Cost</th>
                <th>Assigned</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            BR30 Kadaknath Farms • Shed Management
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const clearModal = () => {
    if (!saving && !uploadingImage) {
      setModal(null);
      setEditingId(null);
      setSelectedRecord(null);
    }
  };

  return (
    <div className="shed-page">
      <style>{`.date-reset-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;padding:0 13px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-text);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.2s ease}.date-reset-btn:hover{background:var(--admin-surface-2);border-color:var(--admin-primary);color:var(--admin-primary)}.date-reset-btn:active{transform:translateY(1px)}.date-reset-btn:hover{background:var(--admin-surface-2);border-color:var(--admin-primary);color:var(--admin-primary)}.search-clear-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:28px;height:28px;border:0;border-radius:7px;background:transparent;color:var(--admin-muted);display:grid;place-items:center;cursor:pointer;padding:0}.search-clear-btn:hover{background:var(--admin-border);color:var(--admin-text)}.search-box input{padding-right:42px}.field[type="date"],.field[type="datetime-local"],.select[type="date"],.select[type="datetime-local"]{color-scheme:light dark}.field[type="date"]::-webkit-calendar-picker-indicator,.field[type="datetime-local"]::-webkit-calendar-picker-indicator,.select[type="date"]::-webkit-calendar-picker-indicator,.select[type="datetime-local"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .field[type="date"]::-webkit-calendar-picker-indicator,.admin-theme-light .field[type="datetime-local"]::-webkit-calendar-picker-indicator,.admin-theme-light .select[type="date"]::-webkit-calendar-picker-indicator,.admin-theme-light .select[type="datetime-local"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.shed-page{padding:24px;background:var(--admin-bg);min-height:100%;color:var(--admin-text)}.shed-header{margin-bottom:20px;padding:22px 24px;border-radius:18px;background:var(--admin-surface);color:var(--admin-text);position:relative;overflow:hidden;border:1px solid var(--admin-border);box-shadow:none}.shed-header-content{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:20px}.shed-title{display:flex;align-items:center;gap:12px}.shed-title-icon{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:color-mix(in srgb,var(--admin-primary) 14%,transparent);color:var(--admin-primary)}.shed-title h1{margin:0;font-size:24px}.shed-title p{margin:4px 0 0;color:var(--admin-muted);font-size:13px}.shed-header-actions{display:flex;align-items:center;gap:7px;position:relative;z-index:3}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover{background:#4338ca;border-color:#4338ca;color:#fff}.spin{animation:shedSpin 1s linear infinite}@keyframes shedSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.primary-btn,.secondary-btn,.danger-btn,.icon-btn{border:1px solid var(--admin-border);border-radius:10px;padding:10px 14px;cursor:pointer;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--admin-surface);color:var(--admin-text)}.primary-btn{background:var(--admin-primary);border-color:var(--admin-primary);color:#fff}.danger-btn{color:var(--admin-danger)}.icon-btn{width:38px;height:38px;padding:0}.primary-btn:disabled,.secondary-btn:disabled,.danger-btn:disabled,.icon-btn:disabled{opacity:.6;cursor:not-allowed}.shed-stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin-bottom:18px}.stat-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:15px}.stat-card span{display:block;color:var(--admin-muted);font-size:12px;margin-bottom:7px}.stat-card strong{font-size:21px}.filters{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:14px;margin-bottom:18px}.filter-row{display:grid;grid-template-columns:minmax(240px,2fr) repeat(5,minmax(135px,1fr));gap:10px;align-items:center}.date-row{display:flex;align-items:center;gap:9px;margin-top:10px;padding-top:10px;border-top:1px solid var(--admin-border)}.field,.select{width:100%;box-sizing:border-box;background:var(--admin-surface-2);border:1px solid var(--admin-border);border-radius:9px;color:var(--admin-text);padding:10px 11px;outline:none}.field:focus,.select:focus{border-color:var(--admin-primary)}.date-filter{width:145px;max-width:145px}.date-reset-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 13px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-text);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.2s ease}.date-reset-btn:active{transform:translateY(1px)}.search-box{position:relative;min-width:0}.search-box svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--admin-muted)}.search-box input{padding-left:36px}.table-wrap{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:auto}.data-table{width:100%;border-collapse:collapse;min-width:1050px}.data-table th,.data-table td{padding:13px 14px;border-bottom:1px solid var(--admin-border);text-align:left;font-size:13px;vertical-align:middle}.data-table th{color:var(--admin-muted);font-size:12px;text-transform:uppercase;letter-spacing:.04em}.data-table tbody tr:hover{background:var(--admin-surface-2)}.muted{color:var(--admin-muted)}.record-title{font-weight:700}.sub-text{font-size:11px;color:var(--admin-muted);margin-top:3px}.status,.priority{display:inline-flex;padding:5px 8px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap}.status.completed{background:#16a34a22;color:#16a34a}.status.progress{background:#2563eb22;color:#2563eb}.status.cancelled{background:#ef444422;color:#ef4444}.status.pending{background:#f59e0b22;color:#d97706}.priority.urgent{background:#ef444422;color:#ef4444}.priority.high{background:#f9731622;color:#ea580c}.priority.medium{background:#f59e0b22;color:#d97706}.priority.low{background:#16a34a22;color:#16a34a}.actions{display:flex;gap:6px}.empty,.loading,.error-box{padding:45px;text-align:center;color:var(--admin-muted)}.error-box{color:var(--admin-danger)}.pagination{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px}.page-buttons{display:flex;gap:6px}.modal-backdrop{position:fixed;inset:0;background:#0009;display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000}.modal{width:min(1050px,100%);max-height:92vh;overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:18px;box-shadow:0 25px 70px #0008}.modal.small{width:min(720px,100%)}.modal-header{position:sticky;top:0;z-index:2;background:var(--admin-surface);display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid var(--admin-border)}.modal-header h2{margin:0;font-size:19px}.modal-body{padding:20px}.form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.form-group{display:flex;flex-direction:column;gap:6px}.form-group.full{grid-column:1/-1}.form-group label{font-size:12px;font-weight:700;color:var(--admin-muted)}.textarea{min-height:90px;resize:vertical}.section-title{grid-column:1/-1;margin-top:7px;padding-top:14px;border-top:1px solid var(--admin-border);font-size:14px;font-weight:800}.modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--admin-border);position:sticky;bottom:0;background:var(--admin-surface)}.material-row,.image-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;margin-bottom:8px}.image-row{grid-template-columns:1fr 1fr auto}.inline-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.upload-btn{position:relative;overflow:hidden}.upload-btn input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}.image-item{border:1px solid var(--admin-border);border-radius:12px;padding:10px;margin-bottom:10px;background:var(--admin-surface-2)}.image-item-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.image-preview{width:100%;height:150px;object-fit:cover;border-radius:9px;border:1px solid var(--admin-border);margin-bottom:8px}.image-url-row{display:grid;grid-template-columns:1fr 1fr auto;gap:8px}.uploading-text{font-size:12px;color:var(--admin-primary);font-weight:700}.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.detail-card{border:1px solid var(--admin-border);border-radius:12px;padding:13px;background:var(--admin-surface-2)}.detail-card span{display:block;color:var(--admin-muted);font-size:11px;margin-bottom:5px}.detail-card strong{font-size:13px}.detail-card.full{grid-column:1/-1}.image-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.image-grid img{width:100%;height:110px;object-fit:cover;border-radius:8px;border:1px solid var(--admin-border)}@media(max-width:1350px){.filter-row{grid-template-columns:minmax(210px,2fr) repeat(5,minmax(115px,1fr))}}@media(max-width:1200px){.filter-row{grid-template-columns:repeat(3,minmax(0,1fr))}.date-filter{width:145px;max-width:145px}}@media(max-width:800px){.shed-page{padding:16px}.shed-header-content{align-items:flex-start;flex-direction:column}.shed-header-actions{width:100%;justify-content:flex-start;flex-wrap:wrap}.shed-stats{grid-template-columns:repeat(2,1fr)}.filter-row{grid-template-columns:1fr 1fr}.date-row{flex-wrap:wrap}.date-filter{width:145px;max-width:145px}.form-grid{grid-template-columns:1fr 1fr}.form-group.full,.section-title{grid-column:1/-1}.image-url-row{grid-template-columns:1fr}.image-row{grid-template-columns:1fr}}@media(max-width:560px){.shed-stats,.filter-row,.form-grid,.detail-grid{grid-template-columns:1fr}.shed-title h1{font-size:20px}.shed-header-actions{display:grid;grid-template-columns:40px 1fr 1fr;width:100%}.shed-header-actions .add-action-btn{grid-column:1/-1;width:100%}.date-row{display:grid;grid-template-columns:1fr 1fr}.date-filter{width:100%;max-width:none}.date-row .date-reset-btn{grid-column:1/-1;width:100%}.pagination{align-items:flex-start;flex-direction:column}.modal-backdrop{padding:8px}.modal-body{padding:14px}.material-row,.image-row{grid-template-columns:1fr}.modal-footer{flex-direction:column}.modal-footer button{width:100%}.image-grid{grid-template-columns:repeat(2,1fr)}}`}</style>

      <div className="shed-header">
        <div className="shed-header-content">
          <div className="shed-title">
            <div className="shed-title-icon">
              <Wrench size={22} />
            </div>

            <div>
              <h1>Shed Management</h1>
              <p>Farm shed maintenance, repair aur service records manage karein.</p>
            </div>
          </div>

          <div className="shed-header-actions">
            <button type="button" className="top-action-btn refresh-action-btn" onClick={loadRecords} disabled={loading} title="Refresh" aria-label="Refresh">
              <RefreshCw size={17} className={loading ? "spin" : ""} />
            </button>

            <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} disabled={!searchedRecords.length} title="Export Excel">
              <FileSpreadsheet size={17} />
              Excel
            </button>

            <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPdf} disabled={!searchedRecords.length} title="Export PDF">
              <FileText size={17} />
              PDF
            </button>

            <button type="button" className="top-action-btn add-action-btn" onClick={openCreate}>
              <Plus size={18} />
              Add Maintenance
            </button>
          </div>
        </div>
      </div>

      <div className="shed-stats">
        <div className="stat-card">
          <span>Total Records</span>
          <strong>{total}</strong>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>

        <div className="stat-card">
          <span>In Progress</span>
          <strong>{stats.progress}</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>

        <div className="stat-card">
          <span>Estimated Cost</span>
          <strong>₹{stats.estimated.toLocaleString("en-IN")}</strong>
        </div>

        <div className="stat-card">
          <span>Actual Cost</span>
          <strong>₹{stats.actual.toLocaleString("en-IN")}</strong>
        </div>
      </div>
      <div className="filters">
        <div className="filter-row">
          <div className="search-box">
            <Search size={17} />

            <input type="text" className="field" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search maintenance..." />

            {search && (
              <button type="button" className="search-clear-btn" onClick={() => setSearch("")} title="Clear search" aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="select"
            value={farmFilter}
            onChange={(e) => {
              setFarmFilter(e.target.value);
              setShedFilter("");
              setPage(1);
            }}>
            <option value="">All Farms</option>

            {farms.map((farm) => (
              <option key={farm._id} value={farm._id}>
                {farm.name} {farm.code ? `(${farm.code})` : ""}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={shedFilter}
            onChange={(e) => {
              setShedFilter(e.target.value);
              setPage(1);
            }}>
            <option value="">All Sheds</option>

            {filterSheds.map((shed) => (
              <option key={shed._id} value={shed._id}>
                {shed.name} {shed.code ? `(${shed.code})` : ""}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}>
            <option value="">All Types</option>

            {MAINTENANCE_TYPES.map((item) => (
              <option key={item} value={item}>
                {formatLabel(item)}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}>
            <option value="">All Priorities</option>

            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {formatLabel(item)}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}>
            <option value="">All Status</option>

            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {formatLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="date-row">
          <input
            className="field date-filter"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            title="From Date"
          />

          <input
            className="field date-filter"
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            title="To Date"
          />

          {(fromDate || toDate) && (
            <button
              type="button"
              className="date-reset-btn"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setPage(1);
              }}
              title="Clear dates">
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="loading">Loading maintenance records...</div>
        ) : error ? (
          <div className="error-box">{error}</div>
        ) : searchedRecords.length === 0 ? (
          <div className="empty">No maintenance records found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Maintenance</th>
                <th>Farm / Shed</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Assigned</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {searchedRecords.map((record) => (
                <tr key={record._id}>
                  <td>
                    <div className="record-title">{record.title}</div>

                    <div className="sub-text">{record.description || "No description"}</div>
                  </td>

                  <td>
                    <div>{record?.farm?.name || "-"}</div>

                    <div className="sub-text">{record?.shed?.name || "-"}</div>
                  </td>

                  <td>{formatLabel(record.maintenanceType)}</td>

                  <td>
                    <span className={getPriorityClass(record.priority)}>{formatLabel(record.priority)}</span>
                  </td>

                  <td>{formatDate(record.maintenanceDate)}</td>

                  <td>
                    <span className={getStatusClass(record.status)}>{formatLabel(record.status)}</span>
                  </td>

                  <td>
                    <div>₹{Number(record.actualCost || 0).toLocaleString("en-IN")}</div>

                    <div className="sub-text">Est. ₹{Number(record.estimatedCost || 0).toLocaleString("en-IN")}</div>
                  </td>

                  <td>{record?.assignedTo?.name || "Unassigned"}</td>

                  <td>
                    <div className="actions">
                      <button className="icon-btn" title="View" onClick={() => openView(record)}>
                        <Eye size={16} />
                      </button>

                      <button className="icon-btn" title="Edit" onClick={() => openEdit(record)}>
                        <Pencil size={16} />
                      </button>

                      <button className="icon-btn" title="Delete" onClick={() => deleteRecord(record)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && (
          <div className="pagination">
            <span className="muted">
              Page {page} of {totalPages} • {total} records
            </span>

            <div className="page-buttons">
              <button className="secondary-btn" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                Previous
              </button>

              <button className="secondary-btn" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {modal === "form" && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && clearModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? "Edit Shed Maintenance" : "Add Shed Maintenance"}</h2>

              <button className="icon-btn" onClick={clearModal} disabled={saving || Boolean(uploadingImage)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveRecord}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Farm *</label>

                    <select
                      className="select"
                      value={form.farm}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          farm: e.target.value,
                          shed: "",
                        }))
                      }>
                      <option value="">Select Farm</option>

                      {farms.map((farm) => (
                        <option key={farm._id} value={farm._id}>
                          {farm.name} {farm.code ? `(${farm.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Shed *</label>

                    <select className="select" value={form.shed} onChange={(e) => updateForm("shed", e.target.value)}>
                      <option value="">Select Shed</option>

                      {filteredSheds.map((shed) => (
                        <option key={shed._id} value={shed._id}>
                          {shed.name} {shed.code ? `(${shed.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Maintenance Date *</label>

                    <input className="field" type="date" value={form.maintenanceDate} onChange={(e) => updateForm("maintenanceDate", e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Maintenance Type *</label>

                    <select className="select" value={form.maintenanceType} onChange={(e) => updateForm("maintenanceType", e.target.value)}>
                      {MAINTENANCE_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {formatLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>

                    <select className="select" value={form.priority} onChange={(e) => updateForm("priority", e.target.value)}>
                      {PRIORITIES.map((item) => (
                        <option key={item} value={item}>
                          {formatLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>

                    <select
                      className="select"
                      value={form.status}
                      onChange={(e) => {
                        const value = e.target.value;

                        setForm((prev) => ({
                          ...prev,
                          status: value,
                          completedDate: value === "CANCELLED" ? "" : prev.completedDate,
                        }));
                      }}>
                      {STATUSES.map((item) => (
                        <option key={item} value={item}>
                          {formatLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full">
                    <label>Maintenance Title *</label>

                    <input className="field" maxLength={200} value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="e.g. Shed ventilation fan repair" />
                  </div>

                  <div className="form-group full">
                    <label>Description</label>

                    <textarea className="field textarea" maxLength={2000} value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Maintenance details..." />
                  </div>

                  <div className="section-title">Staff & Schedule</div>

                  <div className="form-group">
                    <label>Reported By *</label>

                    <select className="select" value={form.reportedBy} onChange={(e) => updateForm("reportedBy", e.target.value)}>
                      <option value="">Select User</option>

                      {staffUsers.map((user) => {
                        const userId = user?._id || user?.id;

                        return (
                          <option key={userId} value={userId}>
                            {user.name} ({user.role})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assigned To</label>

                    <select className="select" value={form.assignedTo} onChange={(e) => updateForm("assignedTo", e.target.value)}>
                      <option value="">Unassigned</option>

                      {staffUsers.map((user) => {
                        const userId = user?._id || user?.id;

                        return (
                          <option key={userId} value={userId}>
                            {user.name} ({user.role})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Scheduled Date</label>

                    <input className="field" type="datetime-local" value={form.scheduledDate} onChange={(e) => updateForm("scheduledDate", e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Completed Date</label>

                    <input className="field" type="datetime-local" disabled={form.status === "CANCELLED"} value={form.completedDate} onChange={(e) => updateForm("completedDate", e.target.value)} />
                  </div>

                  <div className="section-title">Cost & Vendor</div>

                  <div className="form-group">
                    <label>Estimated Cost</label>

                    <input className="field" type="number" min="0" step="0.01" value={form.estimatedCost} onChange={(e) => updateForm("estimatedCost", e.target.value)} placeholder="0" />
                  </div>

                  <div className="form-group">
                    <label>Actual Cost</label>

                    <input className="field" type="number" min="0" step="0.01" value={form.actualCost} onChange={(e) => updateForm("actualCost", e.target.value)} placeholder="0" />
                  </div>

                  <div className="form-group">
                    <label>Vendor Name</label>

                    <input className="field" maxLength={150} value={form.vendor.name} onChange={(e) => updateVendor("name", e.target.value)} placeholder="Vendor name" />
                  </div>

                  <div className="form-group">
                    <label>Vendor Phone</label>

                    <input className="field" maxLength={30} value={form.vendor.phone} onChange={(e) => updateVendor("phone", e.target.value)} placeholder="Phone" />
                  </div>

                  <div className="form-group">
                    <label>Vendor Company</label>

                    <input className="field" maxLength={150} value={form.vendor.company} onChange={(e) => updateVendor("company", e.target.value)} placeholder="Company" />
                  </div>

                  <div className="section-title">Materials Used</div>

                  <div className="form-group full">
                    <div className="inline-actions">
                      <button type="button" className="secondary-btn" onClick={addMaterial}>
                        <Plus size={15} />
                        Add Material
                      </button>
                    </div>
                  </div>

                  <div className="form-group full">
                    {form.materialsUsed.map((material, index) => (
                      <div className="material-row" key={`material-${index}`}>
                        <input className="field" value={material.name} onChange={(e) => updateMaterial(index, "name", e.target.value)} placeholder="Material name" />

                        <input className="field" type="number" min="0" value={material.quantity} onChange={(e) => updateMaterial(index, "quantity", e.target.value)} placeholder="Qty" />

                        <input className="field" value={material.unit} onChange={(e) => updateMaterial(index, "unit", e.target.value)} placeholder="Unit" />

                        <input className="field" type="number" min="0" step="0.01" value={material.cost} onChange={(e) => updateMaterial(index, "cost", e.target.value)} placeholder="Cost" />

                        <button type="button" className="icon-btn" onClick={() => removeMaterial(index)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="section-title">Before Images</div>

                  <div className="form-group full">
                    <div className="inline-actions">
                      <button type="button" className="secondary-btn upload-btn" disabled={uploadingImage === "beforeImages" || form.beforeImages.length >= 20}>
                        <Upload size={15} />

                        {uploadingImage === "beforeImages" ? "Uploading..." : "Upload Before Image"}

                        <input ref={beforeImageInputRef} type="file" accept="image/*" disabled={uploadingImage === "beforeImages" || form.beforeImages.length >= 20} onChange={(e) => handleImageInput(e, "beforeImages")} />
                      </button>

                      <button type="button" className="secondary-btn" disabled={form.beforeImages.length >= 20} onClick={() => addImage("beforeImages")}>
                        <ImagePlus size={15} />
                        Add Image URL
                      </button>

                      <span className="muted">{form.beforeImages.length}/20</span>
                    </div>
                  </div>

                  <div className="form-group full">
                    {form.beforeImages.map((image, index) => (
                      <div className="image-item" key={`before-${index}`}>
                        <div className="image-item-top">
                          <strong>Before Image {index + 1}</strong>

                          <button type="button" className="icon-btn" onClick={() => removeImage("beforeImages", index)}>
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {image.url && <img className="image-preview" src={image.url} alt={`Before ${index + 1}`} />}

                        <div className="image-url-row">
                          <input className="field" value={image.url} onChange={(e) => updateImage("beforeImages", index, "url", e.target.value)} placeholder="Image URL" />

                          <input className="field" value={image.publicId} onChange={(e) => updateImage("beforeImages", index, "publicId", e.target.value)} placeholder="Cloudinary Public ID" />

                          <button type="button" className="secondary-btn" onClick={() => beforeImageInputRef.current?.click()} disabled={Boolean(uploadingImage)}>
                            <Upload size={14} />
                            Replace
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="section-title">After Images</div>

                  <div className="form-group full">
                    <div className="inline-actions">
                      <button type="button" className="secondary-btn upload-btn" disabled={uploadingImage === "afterImages" || form.afterImages.length >= 20}>
                        <Upload size={15} />

                        {uploadingImage === "afterImages" ? "Uploading..." : "Upload After Image"}

                        <input ref={afterImageInputRef} type="file" accept="image/*" disabled={uploadingImage === "afterImages" || form.afterImages.length >= 20} onChange={(e) => handleImageInput(e, "afterImages")} />
                      </button>

                      <button type="button" className="secondary-btn" disabled={form.afterImages.length >= 20} onClick={() => addImage("afterImages")}>
                        <ImagePlus size={15} />
                        Add Image URL
                      </button>

                      <span className="muted">{form.afterImages.length}/20</span>
                    </div>
                  </div>

                  <div className="form-group full">
                    {form.afterImages.map((image, index) => (
                      <div className="image-item" key={`after-${index}`}>
                        <div className="image-item-top">
                          <strong>After Image {index + 1}</strong>

                          <button type="button" className="icon-btn" onClick={() => removeImage("afterImages", index)}>
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {image.url && <img className="image-preview" src={image.url} alt={`After ${index + 1}`} />}

                        <div className="image-url-row">
                          <input className="field" value={image.url} onChange={(e) => updateImage("afterImages", index, "url", e.target.value)} placeholder="Image URL" />

                          <input className="field" value={image.publicId} onChange={(e) => updateImage("afterImages", index, "publicId", e.target.value)} placeholder="Cloudinary Public ID" />

                          <button type="button" className="secondary-btn" onClick={() => afterImageInputRef.current?.click()} disabled={Boolean(uploadingImage)}>
                            <Upload size={14} />
                            Replace
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="form-group full">
                    <label>Notes</label>

                    <textarea className="field textarea" maxLength={2000} value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder="Additional notes..." />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={clearModal} disabled={saving || Boolean(uploadingImage)}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={saving || Boolean(uploadingImage)}>
                  {saving ? "Saving..." : editingId ? "Update Maintenance" : "Create Maintenance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && selectedRecord && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && clearModal()}>
          <div className="modal small">
            <div className="modal-header">
              <h2>Maintenance Details</h2>

              <button className="icon-btn" onClick={clearModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-card full">
                  <span>Title</span>
                  <strong>{selectedRecord.title || "-"}</strong>
                </div>

                <div className="detail-card">
                  <span>Farm</span>
                  <strong>{selectedRecord?.farm?.name || "-"}</strong>
                </div>

                <div className="detail-card">
                  <span>Shed</span>
                  <strong>{selectedRecord?.shed?.name || "-"}</strong>
                </div>

                <div className="detail-card">
                  <span>Maintenance Type</span>
                  <strong>{formatLabel(selectedRecord.maintenanceType)}</strong>
                </div>

                <div className="detail-card">
                  <span>Priority</span>
                  <strong>{formatLabel(selectedRecord.priority)}</strong>
                </div>

                <div className="detail-card">
                  <span>Status</span>
                  <strong>{formatLabel(selectedRecord.status)}</strong>
                </div>

                <div className="detail-card">
                  <span>Maintenance Date</span>
                  <strong>{formatDate(selectedRecord.maintenanceDate)}</strong>
                </div>

                <div className="detail-card">
                  <span>Scheduled Date</span>
                  <strong>{formatDateTime(selectedRecord.scheduledDate)}</strong>
                </div>

                <div className="detail-card">
                  <span>Completed Date</span>
                  <strong>{formatDateTime(selectedRecord.completedDate)}</strong>
                </div>

                <div className="detail-card">
                  <span>Estimated Cost</span>
                  <strong>₹{Number(selectedRecord.estimatedCost || 0).toLocaleString("en-IN")}</strong>
                </div>

                <div className="detail-card">
                  <span>Actual Cost</span>
                  <strong>₹{Number(selectedRecord.actualCost || 0).toLocaleString("en-IN")}</strong>
                </div>

                <div className="detail-card">
                  <span>Reported By</span>
                  <strong>{selectedRecord?.reportedBy?.name || "-"}</strong>
                </div>

                <div className="detail-card">
                  <span>Assigned To</span>
                  <strong>{selectedRecord?.assignedTo?.name || "Unassigned"}</strong>
                </div>

                <div className="detail-card">
                  <span>Vendor</span>
                  <strong>{selectedRecord?.vendor?.name || selectedRecord?.vendor?.company || "-"}</strong>
                </div>

                <div className="detail-card">
                  <span>Vendor Phone</span>
                  <strong>{selectedRecord?.vendor?.phone || "-"}</strong>
                </div>

                <div className="detail-card full">
                  <span>Description</span>
                  <strong>{selectedRecord.description || "-"}</strong>
                </div>

                <div className="detail-card full">
                  <span>Notes</span>
                  <strong>{selectedRecord.notes || "-"}</strong>
                </div>

                {Array.isArray(selectedRecord.materialsUsed) && selectedRecord.materialsUsed.length > 0 && (
                  <div className="detail-card full">
                    <span>Materials Used</span>

                    <div style={{ marginTop: 8 }}>
                      {selectedRecord.materialsUsed.map((material, index) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: 7,
                          }}>
                          <strong>{material.name || "Material"}</strong> — {material.quantity ?? 0} {material.unit || ""} — ₹{Number(material.cost || 0).toLocaleString("en-IN")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(selectedRecord.beforeImages) && selectedRecord.beforeImages.length > 0 && (
                  <div className="detail-card full">
                    <span>Before Images</span>

                    <div className="image-grid">
                      {selectedRecord.beforeImages.map((image, index) => (
                        <img key={index} src={image.url} alt={`Before ${index + 1}`} />
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(selectedRecord.afterImages) && selectedRecord.afterImages.length > 0 && (
                  <div className="detail-card full">
                    <span>After Images</span>

                    <div className="image-grid">
                      {selectedRecord.afterImages.map((image, index) => (
                        <img key={index} src={image.url} alt={`After ${index + 1}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-btn" onClick={clearModal}>
                Close
              </button>

              <button
                className="primary-btn"
                onClick={() => {
                  clearModal();
                  openEdit(selectedRecord);
                }}>
                <Pencil size={15} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
