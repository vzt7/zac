import { forwardRef, useRef } from 'react';

export const AiModal = forwardRef<HTMLButtonElement, any>((props, ref) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        ref={ref}
        className="btn hidden"
        onClick={() => dialogRef.current?.showModal()}
      ></button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box px-7">
          <h3 className="font-bold text-lg py-3">AI features coming soon!</h3>
          <p className="py-4">
            We are working hard to bring you a better experience.
          </p>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
});
