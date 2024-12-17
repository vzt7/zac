import {
  Edit2,
  FileText,
  Fingerprint,
  Gem,
  Lock,
  LogOut,
  Mail,
  User,
} from 'lucide-react';
import { forwardRef, useRef, useState } from 'react';

export const HeaderProfile = forwardRef<HTMLDivElement, any>((props, ref) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = () => {
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  return (
    <>
      <div ref={ref} onClick={openModal}></div>
      <dialog ref={modalRef} className="modal">
        <div className="modal-box m-0 p-0">
          <Profile />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </>
  );
});

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const userData = {
    name: 'John Doe',
    userId: '1234567890',
    email: 'john.doe@example.com',
  };

  const handlePasswordChange = () => {};

  const handleLogout = () => {};

  return (
    <div className="max-w-2xl mx-auto p-0">
      <div className="card bg-base-100 shadow-xl">
        {/* Header */}
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">Profile</h2>

          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm text-base-content/60">Username</div>
                <div className="font-medium">{userData.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm text-base-content/60">Email</div>
                <div className="font-medium">{userData.email}</div>
              </div>
              {/* <button
                className="btn btn-ghost"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4" />
              </button> */}
            </div>

            <div className="flex items-center gap-4">
              <Gem className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm text-base-content/60">Subscription</div>
                <div className="font-medium">Pro</div>
              </div>
              <button
                className="btn btn-accent rounded-full btn-outline text-base-content"
                onClick={() => setIsEditing(true)}
              >
                <img src="/logo2.png" className="w-5 h-5" />
                <span className="text-sm">Upgrade to Pro</span>
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              className="btn btn-outline w-full flex items-center gap-2"
              onClick={handlePasswordChange}
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>

            <button
              className="btn btn-outline btn-error w-full flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="divider"></div>

          {/* Footer Links */}
          <div className="flex flex-row gap-6 text-sm text-base-content/60">
            <a
              href="/terms"
              className="link link-hover flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="link link-hover flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit Profile</h3>
            <div className="py-4">
              <input
                type="text"
                placeholder="Name"
                className="input input-bordered w-full"
                defaultValue={userData.name}
              />
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn btn-primary">Save</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsEditing(false)}>Close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};
