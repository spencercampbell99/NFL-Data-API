import { FC, ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    padding?: string;
    minWidth?: string;
    contentsMinWidth?: string;
    children: ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children, padding, minWidth, contentsMinWidth }) => {
  if (!isOpen) return null;

  return (
    <>
        <div
            className="items-center flex overflow-x-auto overflow-y-scroll fixed inset-0 z-50 outline-none focus:outline-none"
        >
            <div className="relative w-auto my-6 mx-auto max-w-screen-sm max-h-screen" style={{minWidth: minWidth}}>
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none p-10"
                    style={{padding: padding, minWidth: contentsMinWidth}}
                >
                    {children}
                </div>
            </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};

export default Modal;