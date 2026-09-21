import { useEffect, useState } from "react";
import { UserCog, ShieldCheck, ShieldOff, Search, RefreshCw, UserRoundCheck, UserRoundX } from "lucide-react";

import apiRequest from "../../api/api";
import Swal from "sweetalert2";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);

      const response = await apiRequest("/admin/users/staff");

      const list = response?.staff || response?.data?.staff || response?.data || [];

      setStaff(Array.isArray(list) ? list : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to load staff",
        text: error?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter((person) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return person.name?.toLowerCase().includes(query) || person.email?.toLowerCase().includes(query) || person.phone?.toLowerCase().includes(query);
  });

  const handleRoleChange = async (person, nextRole) => {
    if (!nextRole || nextRole === person.role) return;

    const result = await Swal.fire({
      icon: "question",
      title: "Change user role?",
      html: `
        <div style="font-size:13px">
          <strong>${person.name || "User"}</strong><br/>
          Change role from
          <strong>${person.role}</strong>
          to
          <strong>${nextRole}</strong>?
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Change Role",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionId(person._id);

      await apiRequest(`/admin/users/${person._id}/role`, {
        method: "PUT",
        body: {
          role: nextRole,
        },
      });

      await Swal.fire({
        icon: "success",
        title: "Role updated",
        text: `${person.name}'s role has been changed to ${nextRole}.`,
        timer: 1600,
        showConfirmButton: false,
      });

      await fetchStaff();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Role change failed",
        text: error?.message || "Unable to change user role.",
      });
    } finally {
      setActionId(null);
    }
  };

  const handleBlockToggle = async (person) => {
    const blocked = Boolean(person.isBlocked);

    const result = await Swal.fire({
      icon: blocked ? "question" : "warning",
      title: blocked ? "Unblock staff?" : "Block staff?",
      text: blocked ? `${person.name} will be allowed to access the system again.` : `${person.name} will no longer be able to access the system.`,
      showCancelButton: true,
      confirmButtonText: blocked ? "Unblock" : "Block",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionId(person._id);

      await apiRequest(`/admin/users/${person._id}/block`, {
        method: "PUT",
      });

      await Swal.fire({
        icon: "success",
        title: blocked ? "Staff unblocked" : "Staff blocked",
        timer: 1500,
        showConfirmButton: false,
      });

      await fetchStaff();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Action failed",
        text: error?.message || "Unable to update staff status.",
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="staff-page">
      <section className="staff-heading">
        <div>
          <div className="staff-eyebrow">ADMIN ONLY</div>
          <h1>Staff Control</h1>
          <p>Manage staff access, roles and account status.</p>
        </div>

        <button type="button" className="staff-refresh" onClick={fetchStaff} disabled={loading}>
          <RefreshCw size={16} className={loading ? "staff-spin" : ""} />
          Refresh
        </button>
      </section>

      <section className="staff-toolbar admin-card">
        <div className="staff-toolbar-title">
          <div className="staff-toolbar-icon">
            <UserCog size={18} />
          </div>

          <div>
            <strong>{staff.length} Staff</strong>
            <span>Staff accounts currently registered</span>
          </div>
        </div>

        <div className="staff-search">
          <Search size={16} />
          <input type="search" placeholder="Search name, email or phone..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </section>

      <section className="staff-table-card admin-card">
        {loading ? (
          <div className="staff-loading">
            <RefreshCw className="staff-spin" size={25} />
            <span>Loading staff...</span>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="staff-empty">
            <UserCog size={36} />
            <strong>{search ? "No staff found" : "No staff accounts"}</strong>
            <span>{search ? "Try a different search." : "Staff members will appear here when assigned the staff role."}</span>
          </div>
        ) : (
          <div className="staff-table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>STAFF</th>
                  <th>PHONE</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredStaff.map((person) => {
                  const busy = actionId === person._id;

                  return (
                    <tr key={person._id}>
                      <td>
                        <div className="staff-person">
                          <div className="staff-person-avatar">{person.name?.charAt(0)?.toUpperCase() || "S"}</div>

                          <div>
                            <strong>{person.name || "Unknown"}</strong>
                            <span>{person.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="staff-muted">{person.phone || "—"}</span>
                      </td>

                      <td>
                        <select className="staff-role-select" value={person.role} disabled={busy} onChange={(event) => handleRoleChange(person, event.target.value)}>
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td>
                        <span className={`staff-status ${person.isBlocked ? "blocked" : "active"}`}>
                          {person.isBlocked ? (
                            <>
                              <ShieldOff size={13} />
                              Blocked
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={13} />
                              Active
                            </>
                          )}
                        </span>
                      </td>

                      <td>
                        <button type="button" className={`staff-action ${person.isBlocked ? "unblock" : "block"}`} disabled={busy} onClick={() => handleBlockToggle(person)}>
                          {person.isBlocked ? (
                            <>
                              <UserRoundCheck size={15} />
                              Unblock
                            </>
                          ) : (
                            <>
                              <UserRoundX size={15} />
                              Block
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .staff-page {
          max-width: 1600px;
          margin: 0 auto;
        }

        .staff-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .staff-eyebrow {
          color: var(--admin-primary);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.8px;
          margin-bottom: 8px;
        }

        .staff-heading h1 {
          margin: 0;
          font-size: clamp(27px, 4vw, 36px);
          letter-spacing: -1px;
        }

        .staff-heading p {
          margin: 7px 0 0;
          color: var(--admin-muted);
          font-size: 13px;
        }

        .staff-refresh {
          height: 40px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          background: var(--admin-surface);
          color: var(--admin-text);
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .staff-refresh:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .staff-spin {
          animation: staffSpin .8s linear infinite;
        }

        @keyframes staffSpin {
          to { transform: rotate(360deg); }
        }

        .staff-toolbar {
          min-height: 76px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 15px;
        }

        .staff-toolbar-title {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .staff-toolbar-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: var(--admin-primary-soft);
          color: var(--admin-primary);
        }

        .staff-toolbar-title > div:last-child {
          display: flex;
          flex-direction: column;
        }

        .staff-toolbar-title strong {
          font-size: 13px;
        }

        .staff-toolbar-title span {
          color: var(--admin-muted);
          font-size: 10px;
          margin-top: 3px;
        }

        .staff-search {
          width: min(360px, 100%);
          height: 40px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          background: var(--admin-surface-2);
          color: var(--admin-muted);
        }

        .staff-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--admin-text);
          font: inherit;
          font-size: 11px;
        }

        .staff-search input::placeholder {
          color: var(--admin-muted);
        }

        .staff-table-card {
          overflow: hidden;
        }

        .staff-table-wrapper {
          overflow-x: auto;
        }

        .staff-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        .staff-table th {
          padding: 14px 18px;
          text-align: left;
          color: var(--admin-muted);
          font-size: 9px;
          letter-spacing: 1px;
          font-weight: 800;
          border-bottom: 1px solid var(--admin-border);
          white-space: nowrap;
        }

        .staff-table td {
          padding: 15px 18px;
          border-bottom: 1px solid var(--admin-border);
          vertical-align: middle;
        }

        .staff-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .staff-table tbody tr:hover {
          background: var(--admin-surface-2);
        }

        .staff-person {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .staff-person-avatar {
          flex: 0 0 auto;
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: var(--admin-primary-soft);
          color: var(--admin-primary);
          font-size: 12px;
          font-weight: 800;
        }

        .staff-person > div:last-child {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .staff-person strong {
          font-size: 12px;
        }

        .staff-person span {
          margin-top: 3px;
          color: var(--admin-muted);
          font-size: 10px;
        }

        .staff-muted {
          color: var(--admin-muted);
          font-size: 11px;
        }

        .staff-role-select {
          height: 34px;
          min-width: 115px;
          padding: 0 9px;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          outline: none;
          background: var(--admin-surface-2);
          color: var(--admin-text);
          font: inherit;
          font-size: 11px;
          cursor: pointer;
        }

        .staff-role-select:focus {
          border-color: var(--admin-primary);
        }

        .staff-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 800;
        }

        .staff-status.active {
          color: var(--admin-primary);
          background: var(--admin-primary-soft);
        }

        .staff-status.blocked {
          color: var(--admin-danger);
          background: rgba(255,93,108,.10);
        }

        .staff-action {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px;
          border-radius: 8px;
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .staff-action.block {
          color: var(--admin-danger);
          background: rgba(255,93,108,.08);
          border-color: rgba(255,93,108,.15);
        }

        .staff-action.unblock {
          color: var(--admin-primary);
          background: var(--admin-primary-soft);
          border-color: rgba(121,211,74,.15);
        }

        .staff-action:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .staff-loading,
        .staff-empty {
          min-height: 320px;
          display: grid;
          place-content: center;
          justify-items: center;
          gap: 8px;
          color: var(--admin-muted);
        }

        .staff-empty svg {
          color: var(--admin-primary);
          margin-bottom: 5px;
        }

        .staff-empty strong {
          color: var(--admin-text);
          font-size: 14px;
        }

        .staff-empty span,
        .staff-loading span {
          font-size: 11px;
        }

        @media (max-width: 700px) {
          .staff-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .staff-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .staff-search {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Staff;
