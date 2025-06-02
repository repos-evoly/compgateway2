"use client";

import React from "react";
import Image from "next/image";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import {
  FiHash,
  FiUser,
  FiUserCheck,
  FiUserPlus,
  FiMail,
  FiLock,
  FiPhone,
} from "react-icons/fi";
import type { TKycResponse, TRegisterFields } from "../types";
import FormInputIcon from "@/app/components/FormUI/FormInputIcon";
import SubmitButton from "@/app/components/FormUI/SubmitButton";

type RegisterFormProps = {
  /** The data object from KYC (already fetched). */
  kycData: TKycResponse["data"] | undefined;

  /** The parent's handleSubmit logic is passed here */
  onSubmit: (
    values: Omit<TRegisterFields, "roleId">,
    formikHelpers: FormikHelpers<Omit<TRegisterFields, "roleId">>
  ) => void;
};

export default function RegisterForm({ kycData, onSubmit }: RegisterFormProps) {
  // If we have no KYC data, display fallback
  if (!kycData) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md" dir="rtl">
        <Image
          src="/images/logo-trans.png"
          alt="الشعار"
          width={80}
          height={80}
          className="w-auto h-16 mx-auto mb-4"
        />
        <p className="text-red-600 text-center font-medium">
          لا توجد بيانات KYC للعرض.
        </p>
      </div>
    );
  }

  // Extract read-only KYC data
  const {
    companyId,
    branchId,
    legalCompanyName,
    legalCompanyNameLT,
    mobile,
    nationality,
    city,
  } = kycData;

  // Formik initial values
  const initialValues: Omit<TRegisterFields, "roleId"> = {
    companyCode: companyId, // disabled input
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  };

  // Validation schema
  const validationSchema = Yup.object({
    companyCode: Yup.string().required("حقل رمز الشركة مطلوب"),
    username: Yup.string().required("اسم المستخدم مطلوب"),
    firstName: Yup.string().required("الاسم الأول مطلوب"),
    lastName: Yup.string().required("الاسم الأخير مطلوب"),
    email: Yup.string()
      .email("صيغة بريد إلكتروني غير صالحة")
      .required("البريد الإلكتروني مطلوب"),
    password: Yup.string().required("كلمة المرور مطلوبة"),
    phone: Yup.string().required("رقم الهاتف مطلوب"),
  });

  return (
    <div
      className="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left: KYC Info */}
        <div className="bg-info-dark text-white p-8 md:w-1/3">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-3 rounded-full">
              <Image
                src="/images/logo-trans.png"
                alt="الشعار"
                width={80}
                height={80}
                className="w-auto h-16"
              />
            </div>
          </div>

          <h1 className="text-xl font-bold text-center mb-8">
            الوحدة الفرعية للمعلومات المالية
          </h1>

          <div className="rounded-xl bg-info-main p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2 text-black">
              معلومات KYC المؤكدة
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">رقم الشركة:</span>
                <span className="font-medium text-black">{companyId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">رقم الفرع:</span>
                <span className="font-medium text-black">{branchId}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-700">اسم الشركة:</span>
                <span className="font-medium text-right text-black">
                  {legalCompanyName}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-700">Legal Name (EN):</span>
                <span className="font-medium text-right text-black">
                  {legalCompanyNameLT}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">رقم الموبايل:</span>
                <span className="font-medium text-black">{mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">الجنسية:</span>
                <span className="font-medium text-black">{nationality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">المدينة:</span>
                <span className="font-medium text-black">{city}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-white mt-8">
            <p>الرجاء تأكيد المعلومات أعلاه قبل إكمال التسجيل</p>
          </div>
        </div>

        {/* Right: Form Fields */}
        <div className="p-8 md:w-2/3">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              إنشاء حساب جديد
            </h2>
            <p className="text-gray-500 text-sm">
              يرجى تعبئة البيانات التالية لإكمال عملية التسجيل
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit} // calls parent's function
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Column 1 */}
                  <div>
                    <FormInputIcon
                      name="companyCode"
                      label="رمز الشركة"
                      type="text"
                      startIcon={<FiHash />}
                      disabled
                    />
                    <FormInputIcon
                      name="username"
                      label="اسم المستخدم"
                      type="text"
                      startIcon={<FiUser />}
                    />
                    <FormInputIcon
                      name="firstName"
                      label="الاسم الأول"
                      type="text"
                      startIcon={<FiUserCheck />}
                    />
                    <FormInputIcon
                      name="lastName"
                      label="الاسم الأخير"
                      type="text"
                      startIcon={<FiUserPlus />}
                    />
                  </div>

                  {/* Column 2 */}
                  <div>
                    <FormInputIcon
                      name="email"
                      label="البريد الإلكتروني"
                      type="email"
                      startIcon={<FiMail />}
                    />
                    <FormInputIcon
                      name="password"
                      label="كلمة المرور"
                      type="password"
                      startIcon={<FiLock />}
                    />
                    <FormInputIcon
                      name="phone"
                      label="رقم الهاتف"
                      type="text"
                      startIcon={<FiPhone />}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <SubmitButton
                    title="تسجيل الحساب"
                    isSubmitting={isSubmitting}
                    color="info-dark"
                  />
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center text-sm text-black">
            بالضغط على زر التسجيل أنت توافق على الشروط والأحكام الخاصة بالخدمة
          </div>
        </div>
      </div>
    </div>
  );
}
