import React from "react";

export interface IModal {
  visible: boolean;
  onClose: () => void;
  title?: string;

  children?: React.ReactNode;
}
