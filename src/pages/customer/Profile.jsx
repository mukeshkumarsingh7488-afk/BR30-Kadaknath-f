import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { User, Mail, Phone, MapPin, Camera, Trash2, Save, ShieldCheck, Loader2, Home, Navigation, Pencil, CheckCircle2, LogOut } from "lucide-react";

import apiRequest from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { showError, showSuccess } from "../../utils/sweetAlert";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
};

const emptyProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  role: "customer",
  isEmailVerified: false,
  profilePicture: {
    url: "",
    publicId: "",
  },
};

const normalizeUser = (user) => {
  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    id: user.id || user._id || "",
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "customer",
    isEmailVerified: Boolean(user.isEmailVerified),
    profilePicture: {
      url: user.profilePicture?.url || "",
      publicId: user.profilePicture?.publicId || "",
    },
    address: {
      fullName: user.address?.fullName || "",
      phone: user.address?.phone || "",
      addressLine1: user.address?.addressLine1 || "",
      addressLine2: user.address?.addressLine2 || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      pincode: user.address?.pincode || "",
      landmark: user.address?.landmark || "",
    },
  };
};

const extractUserFromResponse = (response) => {
  if (!response || typeof response !== "object") {
    return null;
  }

  return response.user || response.profile || response.data?.user || response.data?.profile || null;
};

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, refreshUser } = useAuth();

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [removingPicture, setRemovingPicture] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [profile, setProfile] = useState(emptyProfile);
  const [address, setAddress] = useState(emptyAddress);

  const [profileEditing, setProfileEditing] = useState(false);
  const [addressEditing, setAddressEditing] = useState(false);

  /* =========================================
     APPLY USER DATA
     ========================================= */

  const applyUserData = (userData) => {
    const normalizedUser = normalizeUser(userData);

    if (!normalizedUser) {
      return false;
    }

    setProfile({
      id: normalizedUser.id,
      name: normalizedUser.name,
      email: normalizedUser.email,
      phone: normalizedUser.phone,
      role: normalizedUser.role,
      isEmailVerified: normalizedUser.isEmailVerified,
      profilePicture: normalizedUser.profilePicture,
    });

    setAddress(normalizedUser.address);

    localStorage.setItem(
      "br30_user",
      JSON.stringify({
        ...userData,
        id: normalizedUser.id,
        name: normalizedUser.name,
        email: normalizedUser.email,
        phone: normalizedUser.phone,
        role: normalizedUser.role,
        isEmailVerified: normalizedUser.isEmailVerified,
        profilePicture: normalizedUser.profilePicture,
        address: normalizedUser.address,
      })
    );

    return true;
  };

  /* =========================================
     FETCH PROFILE
     ========================================= */

  const fetchProfile = async () => {
    try {
      setLoading(true);

      /*
       * First show AuthContext user immediately.
       * This prevents the page from appearing empty
       * while the API request is running.
       */
      if (authUser) {
        applyUserData(authUser);
      }

      const response = await apiRequest("/profile");

      const apiUser = extractUserFromResponse(response);

      if (apiUser) {
        applyUserData(apiUser);
      } else if (!authUser) {
        /*
         * If API response does not contain user data
         * and AuthContext also has no user, show error.
         */
        throw new Error("User profile data was not returned by the server.");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);

      /*
       * If AuthContext already has user data,
       * don't replace it with an error screen.
       */
      if (!authUser) {
        showError(error.message || "Unable to load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* =========================================
     PROFILE INPUT
     ========================================= */

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     ADDRESS INPUT
     ========================================= */

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     SAVE PROFILE
     ========================================= */

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      showError("Please enter your name.");
      return;
    }

    if (!profile.phone.trim()) {
      showError("Please enter your phone number.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
        }),
      });

      const updatedUser = extractUserFromResponse(response);

      if (updatedUser) {
        applyUserData(updatedUser);
      } else {
        /*
         * Fallback if backend returns only message.
         */
        const updatedLocalUser = {
          ...(authUser || {}),
          name: profile.name.trim(),
          phone: profile.phone.trim(),
        };

        applyUserData(updatedLocalUser);
      }

      /*
       * Refresh AuthContext so Navbar immediately gets
       * the latest name and profile information.
       */
      try {
        await refreshUser();
      } catch (refreshError) {
        console.error("Auth user refresh failed:", refreshError);
      }

      setProfileEditing(false);

      showSuccess(response?.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      showError(error.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  /* =========================================
     SAVE ADDRESS
     ========================================= */

  const handleSaveAddress = async () => {
    if (!address.fullName.trim()) {
      showError("Please enter the delivery name.");
      return;
    }

    if (!address.phone.trim()) {
      showError("Please enter the delivery phone number.");
      return;
    }

    if (!address.addressLine1.trim()) {
      showError("Please enter your address.");
      return;
    }

    if (!address.city.trim()) {
      showError("Please enter your city.");
      return;
    }

    if (!address.state.trim()) {
      showError("Please enter your state.");
      return;
    }

    if (!address.pincode.trim()) {
      showError("Please enter your pincode.");
      return;
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      showError("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      setSavingAddress(true);

      const response = await apiRequest("/profile/address", {
        method: "PUT",
        body: JSON.stringify(address),
      });

      const returnedAddress = response?.address || response?.data?.address || response?.user?.address || response?.profile?.address;

      if (returnedAddress) {
        setAddress({
          fullName: returnedAddress.fullName || "",
          phone: returnedAddress.phone || "",
          addressLine1: returnedAddress.addressLine1 || "",
          addressLine2: returnedAddress.addressLine2 || "",
          city: returnedAddress.city || "",
          state: returnedAddress.state || "",
          pincode: returnedAddress.pincode || "",
          landmark: returnedAddress.landmark || "",
        });

        /*
         * Keep local user address updated.
         */
        try {
          const storedUser = localStorage.getItem("br30_user");

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            localStorage.setItem(
              "br30_user",
              JSON.stringify({
                ...parsedUser,
                address: returnedAddress,
              })
            );
          }
        } catch (storageError) {
          console.error("Address localStorage update failed:", storageError);
        }
      } else {
        /*
         * Backend may return only success/message.
         * In that case keep the current entered address.
         */
        try {
          const storedUser = localStorage.getItem("br30_user");

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            localStorage.setItem(
              "br30_user",
              JSON.stringify({
                ...parsedUser,
                address: address,
              })
            );
          }
        } catch (storageError) {
          console.error("Address localStorage update failed:", storageError);
        }
      }

      try {
        await refreshUser();
      } catch (refreshError) {
        console.error("Auth user refresh failed:", refreshError);
      }

      setAddressEditing(false);

      showSuccess(response?.message || "Address updated successfully.");
    } catch (error) {
      console.error("Address update error:", error);
      showError(error.message || "Unable to update address.");
    } finally {
      setSavingAddress(false);
    }
  };

  /* =========================================
     PROFILE PICTURE UPLOAD
     ========================================= */

  const handlePictureSelect = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showError("Only JPG, PNG and WebP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Profile picture must be smaller than 5MB.");
      e.target.value = "";
      return;
    }

    try {
      setUploadingPicture(true);

      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = localStorage.getItem("br30_access_token");

      if (!token) {
        throw new Error("Your session has expired. Please login again.");
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/picture`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let data;

      try {
        data = await response.json();
      } catch {
        data = {
          success: false,
          message: "Invalid server response.",
        };
      }

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update profile picture.");
      }

      const newPicture = data?.profilePicture || data?.user?.profilePicture || data?.profile?.profilePicture || data?.data?.profilePicture;

      if (newPicture) {
        setProfile((prev) => ({
          ...prev,
          profilePicture: {
            url: newPicture.url || "",
            publicId: newPicture.publicId || "",
          },
        }));

        /*
         * Update stored user so Navbar can use
         * the new picture.
         */
        try {
          const storedUser = localStorage.getItem("br30_user");

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            localStorage.setItem(
              "br30_user",
              JSON.stringify({
                ...parsedUser,
                profilePicture: {
                  url: newPicture.url || "",
                  publicId: newPicture.publicId || "",
                },
              })
            );
          }
        } catch (storageError) {
          console.error("Profile picture localStorage update failed:", storageError);
        }
      }

      try {
        await refreshUser();
      } catch (refreshError) {
        console.error("Auth user refresh failed:", refreshError);
      }

      showSuccess(data?.message || "Profile picture updated successfully.");
    } catch (error) {
      console.error("Profile picture upload error:", error);
      showError(error.message || "Unable to update profile picture.");
    } finally {
      setUploadingPicture(false);
      e.target.value = "";
    }
  };

  /* =========================================
     REMOVE PROFILE PICTURE
     ========================================= */

  const handleRemovePicture = async () => {
    const result = await Swal.fire({
      title: "Remove profile picture?",
      text: "Your current profile picture will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setRemovingPicture(true);

      const response = await apiRequest("/profile/picture", {
        method: "DELETE",
      });

      setProfile((prev) => ({
        ...prev,
        profilePicture: {
          url: "",
          publicId: "",
        },
      }));

      const storedUser = localStorage.getItem("br30_user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          localStorage.setItem(
            "br30_user",
            JSON.stringify({
              ...parsedUser,
              profilePicture: {
                url: "",
                publicId: "",
              },
            })
          );
        } catch (storageError) {
          console.error("Profile picture localStorage update failed:", storageError);
        }
      }

      await refreshUser();

      await Swal.fire({
        icon: "success",
        title: "Picture Removed",
        text: response?.message || "Profile picture removed successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Profile picture remove error:", error);

      await Swal.fire({
        icon: "error",
        title: "Unable to remove picture",
        text: error.message || "Something went wrong.",
        confirmButtonText: "OK",
      });
    } finally {
      setRemovingPicture(false);
    }
  };

  /* =========================================
     LOGOUT
     ========================================= */

  const handleLogout = async () => {
    if (loggingOut) return;

    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout from your BR30 Kadaknath Farms account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoggingOut(true);

      logout();

      await Swal.fire({
        icon: "success",
        title: "Logged out",
        text: "You have been logged out successfully.",
        timer: 1400,
        showConfirmButton: false,
      });

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);

      await Swal.fire({
        icon: "error",
        title: "Logout failed",
        text: "Unable to logout. Please try again.",
        confirmButtonText: "OK",
      });

      setLoggingOut(false);
    }
  };

  /* =========================================
     CANCEL PROFILE EDIT
     ========================================= */

  const handleCancelProfileEdit = () => {
    fetchProfile();
    setProfileEditing(false);
  };

  /* =========================================
     CANCEL ADDRESS EDIT
     ========================================= */

  const handleCancelAddressEdit = () => {
    fetchProfile();
    setAddressEditing(false);
  };

  /* =========================================
     LOADING
     ========================================= */

  if (loading) {
    return (
      <>
        <style>{`
          .profile-loading-page{min-height:70vh;display:flex;align-items:center;justify-content:center;background:#f8fafc}.profile-loading-box{text-align:center;color:#475569}.profile-loading-icon{width:42px;height:42px;animation:profileSpin 1s linear infinite;margin-bottom:12px}@keyframes profileSpin{to{transform:rotate(360deg)}}
        `}</style>

        <div className="profile-loading-page">
          <div className="profile-loading-box">
            <Loader2 className="profile-loading-icon" />
            <div>Loading your profile...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .profile-page{min-height:100vh;background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%);padding:48px 20px 80px}.profile-container{max-width:1080px;margin:0 auto}.profile-header{margin-bottom:28px}.profile-header h1{margin:0;color:#0f172a;font-size:32px;font-weight:800;letter-spacing:-.6px}.profile-header p{margin:8px 0 0;color:#64748b;font-size:15px}.profile-grid{display:grid;grid-template-columns:330px 1fr;gap:24px;align-items:start}.profile-card,.profile-section{background:#fff;border:1px solid #e2e8f0;border-radius:22px;box-shadow:0 10px 35px rgba(15,23,42,.06)}.profile-card{padding:28px;text-align:center;position:sticky;top:95px}.avatar-wrapper{width:128px;height:128px;margin:0 auto 18px;position:relative}.avatar{width:128px;height:128px;border-radius:50%;object-fit:cover;border:5px solid #f1f5f9;box-shadow:0 8px 25px rgba(15,23,42,.12)}.avatar-placeholder{width:128px;height:128px;border-radius:50%;background:linear-gradient(135deg,#e0f2fe,#dbeafe);display:flex;align-items:center;justify-content:center;color:#2563eb;border:5px solid #f1f5f9;box-shadow:0 8px 25px rgba(15,23,42,.1)}.avatar-placeholder svg{width:54px;height:54px}.camera-button{position:absolute;right:2px;bottom:2px;width:40px;height:40px;border:4px solid #fff;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(37,99,235,.35);transition:.2s}.camera-button:hover{background:#1d4ed8;transform:scale(1.05)}.camera-button:disabled{opacity:.65;cursor:not-allowed}.profile-card h2{margin:0;color:#0f172a;font-size:22px;font-weight:800}.profile-email{margin:6px 0 14px;color:#64748b;font-size:14px;word-break:break-word}.verified-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:12px;font-weight:700}.role-badge{display:inline-flex;margin-top:10px;padding:5px 11px;border-radius:999px;background:#eff6ff;color:#2563eb;font-size:12px;font-weight:700;text-transform:capitalize}.picture-actions{display:flex;gap:8px;margin-top:18px}.picture-button{flex:1;border:1px solid #dbe3ed;background:#f8fafc;color:#334155;border-radius:10px;padding:10px 8px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:.2s}.picture-button:hover{background:#f1f5f9}.picture-button.remove{color:#dc2626}.picture-button:disabled{opacity:.55;cursor:not-allowed}.logout-button{width:100%;margin-top:10px;border:1px solid #fecaca;background:#fff;color:#dc2626;border-radius:10px;padding:11px 10px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:.2s}.logout-button:hover{background:#fef2f2;border-color:#fca5a5}.logout-button:disabled{opacity:.55;cursor:not-allowed}.profile-content{display:flex;flex-direction:column;gap:24px}.profile-section{padding:28px}.section-heading{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:24px}.section-title-wrap{display:flex;align-items:center;gap:13px}.section-icon{width:42px;height:42px;border-radius:12px;background:#eff6ff;color:#2563eb;display:flex;align-items:center;justify-content:center}.section-heading h2{margin:0;color:#0f172a;font-size:20px;font-weight:800}.section-heading p{margin:4px 0 0;color:#64748b;font-size:13px}.edit-button{border:1px solid #dbe3ed;background:#fff;color:#334155;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px}.edit-button:hover{background:#f8fafc}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.form-group{display:flex;flex-direction:column;gap:7px}.form-group.full{grid-column:1/-1}.form-label{font-size:13px;font-weight:700;color:#334155}.form-input{width:100%;box-sizing:border-box;border:1px solid #dbe3ed;background:#fff;border-radius:11px;padding:12px 13px;color:#0f172a;font-size:14px;outline:none;transition:.2s}.form-input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(59,130,246,.1)}.form-input:disabled{background:#f8fafc;color:#64748b;cursor:not-allowed}.input-wrap{position:relative}.input-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#94a3b8;width:17px;height:17px}.input-with-icon{padding-left:40px}.readonly-note{margin-top:7px;font-size:11px;color:#94a3b8}.save-row{display:flex;justify-content:flex-end;gap:10px;margin-top:24px;padding-top:20px;border-top:1px solid #eef2f7}.cancel-button,.save-button{border:none;border-radius:11px;padding:11px 18px;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px}.cancel-button{background:#f1f5f9;color:#475569}.cancel-button:hover{background:#e2e8f0}.save-button{background:#2563eb;color:#fff;box-shadow:0 5px 14px rgba(37,99,235,.2)}.save-button:hover{background:#1d4ed8}.save-button:disabled,.cancel-button:disabled{opacity:.6;cursor:not-allowed}.address-preview{padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:13px;color:#475569;font-size:14px;line-height:1.7}.address-preview strong{color:#0f172a}.empty-address{display:flex;align-items:center;gap:10px;padding:16px;border-radius:13px;background:#f8fafc;border:1px dashed #cbd5e1;color:#64748b;font-size:14px}.security-row{display:flex;align-items:center;justify-content:space-between;padding:15px 0;border-bottom:1px solid #eef2f7}.security-row:last-child{border-bottom:0;padding-bottom:0}.security-info{display:flex;align-items:center;gap:12px}.security-info-icon{width:38px;height:38px;border-radius:10px;background:#f8fafc;color:#64748b;display:flex;align-items:center;justify-content:center}.security-info strong{display:block;color:#334155;font-size:14px}.security-info span{display:block;color:#94a3b8;font-size:12px;margin-top:2px}.status-ok{display:flex;align-items:center;gap:5px;color:#059669;font-size:12px;font-weight:800}.status-role{padding:5px 10px;background:#eff6ff;color:#2563eb;border-radius:999px;font-size:12px;font-weight:800;text-transform:capitalize}.profile-note{margin-top:22px;padding:14px 16px;border-radius:12px;background:#eff6ff;color:#1e40af;font-size:12px;line-height:1.6}.profile-note strong{font-weight:800}@media(max-width:850px){.profile-grid{grid-template-columns:1fr}.profile-card{position:static}.profile-card{max-width:500px;width:100%;box-sizing:border-box;margin:0 auto}}@media(max-width:600px){.profile-page{padding:30px 14px 60px}.profile-header h1{font-size:27px}.profile-section{padding:20px;border-radius:18px}.profile-card{padding:22px;border-radius:18px}.form-grid{grid-template-columns:1fr}.form-group.full{grid-column:auto}.section-heading{align-items:flex-start}.section-heading h2{font-size:18px}.edit-button{padding:8px 11px}.save-row{flex-direction:column}.cancel-button,.save-button{width:100%}.picture-actions{flex-direction:column}}
      `}</style>

      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Manage your personal details and delivery information.</p>
          </div>

          <div className="profile-grid">
            {/* =========================================
                PROFILE CARD
                ========================================= */}

            <aside className="profile-card">
              <div className="avatar-wrapper">
                {profile.profilePicture.url ? (
                  <img src={profile.profilePicture.url} alt={profile.name || "Profile"} className="avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    <User />
                  </div>
                )}

                <button type="button" className="camera-button" onClick={() => fileInputRef.current?.click()} disabled={uploadingPicture} title="Change profile picture">
                  {uploadingPicture ? (
                    <Loader2
                      style={{
                        width: 18,
                        height: 18,
                        animation: "profileSpin 1s linear infinite",
                      }}
                    />
                  ) : (
                    <Camera style={{ width: 18, height: 18 }} />
                  )}
                </button>

                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePictureSelect} style={{ display: "none" }} />
              </div>

              <h2>{profile.name || "Your Name"}</h2>

              <div className="profile-email">{profile.email || "No email available"}</div>

              {profile.isEmailVerified && (
                <div className="verified-badge">
                  <CheckCircle2 style={{ width: 14, height: 14 }} />
                  Email Verified
                </div>
              )}

              <div>
                <span className="role-badge">{profile.role}</span>
              </div>

              {/* Picture Buttons */}

              <div className="picture-actions">
                <button type="button" className="picture-button" onClick={() => fileInputRef.current?.click()} disabled={uploadingPicture}>
                  <Camera style={{ width: 15, height: 15 }} />

                  {uploadingPicture ? "Uploading..." : "Change"}
                </button>

                {profile.profilePicture.url && (
                  <button type="button" className="picture-button remove" onClick={handleRemovePicture} disabled={removingPicture}>
                    {removingPicture ? (
                      <Loader2
                        style={{
                          width: 15,
                          height: 15,
                          animation: "profileSpin 1s linear infinite",
                        }}
                      />
                    ) : (
                      <Trash2 style={{ width: 15, height: 15 }} />
                    )}
                    Remove
                  </button>
                )}
              </div>

              {/* Logout */}

              <button type="button" className="logout-button" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? (
                  <Loader2
                    style={{
                      width: 16,
                      height: 16,
                      animation: "profileSpin 1s linear infinite",
                    }}
                  />
                ) : (
                  <LogOut style={{ width: 16, height: 16 }} />
                )}

                {loggingOut ? "Logging out..." : "Logout"}
              </button>

              <div className="profile-note">
                <strong>Profile picture:</strong> JPG, PNG or WebP only. Maximum file size is 5MB.
              </div>
            </aside>

            {/* =========================================
                RIGHT CONTENT
                ========================================= */}

            <div className="profile-content">
              {/* PERSONAL INFORMATION */}

              <section className="profile-section">
                <div className="section-heading">
                  <div className="section-title-wrap">
                    <div className="section-icon">
                      <User style={{ width: 21, height: 21 }} />
                    </div>

                    <div>
                      <h2>Personal Information</h2>
                      <p>Keep your account details up to date.</p>
                    </div>
                  </div>

                  {!profileEditing && (
                    <button type="button" className="edit-button" onClick={() => setProfileEditing(true)}>
                      <Pencil style={{ width: 14, height: 14 }} />
                      Edit
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>

                    <div className="input-wrap">
                      <User className="input-icon" />

                      <input type="text" name="name" value={profile.name} onChange={handleProfileChange} disabled={!profileEditing || savingProfile} className="form-input input-with-icon" placeholder="Enter your name" maxLength={80} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>

                    <div className="input-wrap">
                      <Phone className="input-icon" />

                      <input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} disabled={!profileEditing || savingProfile} className="form-input input-with-icon" placeholder="Enter phone number" maxLength={20} />
                    </div>
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Email Address</label>

                    <div className="input-wrap">
                      <Mail className="input-icon" />

                      <input type="email" value={profile.email} disabled className="form-input input-with-icon" />
                    </div>

                    <div className="readonly-note">Email changes will be available through secure OTP verification.</div>
                  </div>
                </div>

                {profileEditing && (
                  <div className="save-row">
                    <button type="button" className="cancel-button" onClick={handleCancelProfileEdit} disabled={savingProfile}>
                      Cancel
                    </button>

                    <button type="button" className="save-button" onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? (
                        <>
                          <Loader2
                            style={{
                              width: 16,
                              height: 16,
                              animation: "profileSpin 1s linear infinite",
                            }}
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save style={{ width: 16, height: 16 }} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </section>

              {/* DELIVERY ADDRESS */}

              <section className="profile-section">
                <div className="section-heading">
                  <div className="section-title-wrap">
                    <div className="section-icon">
                      <MapPin style={{ width: 21, height: 21 }} />
                    </div>

                    <div>
                      <h2>Delivery Address</h2>
                      <p>Used for your future product deliveries.</p>
                    </div>
                  </div>

                  {!addressEditing && (
                    <button type="button" className="edit-button" onClick={() => setAddressEditing(true)}>
                      <Pencil style={{ width: 14, height: 14 }} />
                      Edit
                    </button>
                  )}
                </div>

                {!addressEditing ? (
                  address.addressLine1 || address.city || address.state || address.pincode ? (
                    <div className="address-preview">
                      <strong>{address.fullName}</strong>
                      <br />
                      {address.phone && (
                        <>
                          {address.phone}
                          <br />
                        </>
                      )}
                      {address.addressLine1}
                      {address.addressLine2 && <>, {address.addressLine2}</>}
                      <br />
                      {address.city}, {address.state} - {address.pincode}
                      {address.landmark && (
                        <>
                          <br />
                          Landmark: {address.landmark}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="empty-address">
                      <Home style={{ width: 18, height: 18 }} />
                      No delivery address added yet.
                    </div>
                  )
                ) : (
                  <>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Delivery Name</label>

                        <input type="text" name="fullName" value={address.fullName} onChange={handleAddressChange} disabled={savingAddress} className="form-input" placeholder="Full name" maxLength={80} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Delivery Phone</label>

                        <input type="tel" name="phone" value={address.phone} onChange={handleAddressChange} disabled={savingAddress} className="form-input" placeholder="Phone number" maxLength={20} />
                      </div>

                      <div className="form-group full">
                        <label className="form-label">Address Line 1</label>

                        <div className="input-wrap">
                          <MapPin className="input-icon" />

                          <input type="text" name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} disabled={savingAddress} className="form-input input-with-icon" placeholder="House / Flat / Street" maxLength={200} />
                        </div>
                      </div>

                      <div className="form-group full">
                        <label className="form-label">Address Line 2</label>

                        <input type="text" name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} disabled={savingAddress} className="form-input" placeholder="Area / Colony / Locality" maxLength={200} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">City</label>

                        <input type="text" name="city" value={address.city} onChange={handleAddressChange} disabled={savingAddress} className="form-input" placeholder="City" maxLength={80} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">State</label>

                        <input type="text" name="state" value={address.state} onChange={handleAddressChange} disabled={savingAddress} className="form-input" placeholder="State" maxLength={80} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Pincode</label>

                        <input type="text" name="pincode" value={address.pincode} onChange={handleAddressChange} disabled={savingAddress} className="form-input" placeholder="6-digit pincode" inputMode="numeric" maxLength={6} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Landmark</label>

                        <div className="input-wrap">
                          <Navigation className="input-icon" />

                          <input type="text" name="landmark" value={address.landmark} onChange={handleAddressChange} disabled={savingAddress} className="form-input input-with-icon" placeholder="Nearby landmark" maxLength={120} />
                        </div>
                      </div>
                    </div>

                    <div className="save-row">
                      <button type="button" className="cancel-button" onClick={handleCancelAddressEdit} disabled={savingAddress}>
                        Cancel
                      </button>

                      <button type="button" className="save-button" onClick={handleSaveAddress} disabled={savingAddress}>
                        {savingAddress ? (
                          <>
                            <Loader2
                              style={{
                                width: 16,
                                height: 16,
                                animation: "profileSpin 1s linear infinite",
                              }}
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save style={{ width: 16, height: 16 }} />
                            Save Address
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </section>

              {/* ACCOUNT SECURITY */}

              <section className="profile-section">
                <div className="section-heading">
                  <div className="section-title-wrap">
                    <div className="section-icon">
                      <ShieldCheck style={{ width: 21, height: 21 }} />
                    </div>

                    <div>
                      <h2>Account & Security</h2>
                      <p>Your account status and verification details.</p>
                    </div>
                  </div>
                </div>

                <div className="security-row">
                  <div className="security-info">
                    <div className="security-info-icon">
                      <Mail style={{ width: 18, height: 18 }} />
                    </div>

                    <div>
                      <strong>Email Verification</strong>
                      <span>{profile.email}</span>
                    </div>
                  </div>

                  {profile.isEmailVerified ? (
                    <div className="status-ok">
                      <CheckCircle2 style={{ width: 15, height: 15 }} />
                      Verified
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "#d97706",
                        fontSize: 12,
                        fontWeight: 800,
                      }}>
                      Not Verified
                    </div>
                  )}
                </div>

                <div className="security-row">
                  <div className="security-info">
                    <div className="security-info-icon">
                      <ShieldCheck style={{ width: 18, height: 18 }} />
                    </div>

                    <div>
                      <strong>Account Type</strong>
                      <span>Your BR30 Kadaknath Farms account</span>
                    </div>
                  </div>

                  <span className="status-role">{profile.role}</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
