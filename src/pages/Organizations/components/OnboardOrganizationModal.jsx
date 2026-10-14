import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Steps,
  Switch,
  notification,
} from 'antd';
import { useOnboardOrganization } from '../../../hooks/useOrganizations';
import {
  apiError,
  confirmRules,
  emailRules,
  nameRules,
  passwordRules,
} from './formRules';

/** Fields validated before leaving each step. */
const STEP_FIELDS = [
  ['org_name'],
  ['owner_name', 'owner_email', 'owner_password', 'owner_confirm'],
  ['school_name', 'emis_code', 'uc_name', 'address'],
  [
    'create_admin',
    'admin_name',
    'admin_email',
    'admin_password',
    'admin_confirm',
  ],
  [],
];

const STEPS = [
  { title: 'Organization' },
  { title: 'Owner' },
  { title: 'First School' },
  { title: 'School Admin' },
  { title: 'Review' },
];

/**
 * Onboard a new school owner in one transaction: organization → owner
 * (Super Admin) → first school → optional separate school admin.
 * Every new account must change its password on first sign-in.
 *
 * @param {{ open: boolean, onClose: () => void,
 *   onCreated?: (result: any) => void }} props
 */
export default function OnboardOrganizationModal({ open, onClose, onCreated }) {
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const mutation = useOnboardOrganization();
  const createAdmin = Form.useWatch('create_admin', form);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({ create_admin: false });
    setStep(0);
  }, [open, form]);

  const next = async () => {
    try {
      await form.validateFields(STEP_FIELDS[step]);
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch {
      // inline validation messages are shown
    }
  };

  const submit = async () => {
    const v = form.getFieldsValue(true);
    const payload = {
      organization: { name: v.org_name.trim() },
      owner: {
        name: v.owner_name.trim(),
        email: v.owner_email.trim(),
        password: v.owner_password,
      },
      school: {
        name: v.school_name.trim(),
        emis_code: v.emis_code.trim(),
        uc_name: v.uc_name.trim(),
        address: v.address?.trim() || null,
      },
      admin: v.create_admin
        ? {
            name: v.admin_name.trim(),
            email: v.admin_email.trim(),
            password: v.admin_password,
          }
        : null,
    };
    try {
      const result = await mutation.mutateAsync(payload);
      notification.success({
        message: 'Organization onboarded',
        description: `${payload.organization.name} is ready. New accounts must change their password on first sign-in.`,
      });
      onCreated?.(result);
      onClose();
    } catch (err) {
      notification.error({
        message: 'Onboarding failed',
        description: apiError(err),
      });
    }
  };

  const review = () => {
    const v = form.getFieldsValue(true);
    return (
      <Descriptions
        column={1}
        size="small"
        bordered
        items={[
          { key: 'org', label: 'Organization', children: v.org_name },
          {
            key: 'owner',
            label: 'Owner (Super Admin)',
            children: `${v.owner_name ?? ''} · ${v.owner_email ?? ''}`,
          },
          {
            key: 'school',
            label: 'First school',
            children: `${v.school_name ?? ''} (EMIS ${v.emis_code ?? ''}) · ${v.uc_name ?? ''}`,
          },
          {
            key: 'admin',
            label: 'School admin',
            children: v.create_admin
              ? `${v.admin_name ?? ''} · ${v.admin_email ?? ''}`
              : 'None — the owner runs this school',
          },
        ]}
      />
    );
  };

  const footer = (
    <div className="flex items-center justify-between gap-2">
      <span className="ds-caption">
        Step {step + 1} of {STEPS.length}
      </span>
      <div className="flex gap-2">
        <Button onClick={onClose}>Cancel</Button>
        {step > 0 && (
          <Button onClick={() => setStep((s) => s - 1)}>Back</Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="primary" onClick={next}>
            Next
          </Button>
        ) : (
          <Button type="primary" loading={mutation.isPending} onClick={submit}>
            Create Organization
          </Button>
        )}
      </div>
    </div>
  );

  // All steps stay mounted (hidden) so values survive navigation.
  const show = (i) => (step === i ? undefined : 'hidden');

  return (
    <Modal
      title="Onboard Organization"
      open={open}
      onCancel={onClose}
      footer={footer}
      width={760}
      destroyOnHidden
    >
      <Steps
        size="small"
        current={step}
        items={STEPS}
        className="!mb-6"
        responsive
      />
      <Form form={form} layout="vertical" preserve>
        <div className={show(0)}>
          <p className="ds-caption !mb-4">
            The organization groups every school one owner runs.
          </p>
          <Form.Item
            name="org_name"
            label="Organization name"
            rules={nameRules('the organization name')}
          >
            <Input placeholder="e.g. Green Valley Education Group" />
          </Form.Item>
        </div>

        <div className={show(1)}>
          <p className="ds-caption !mb-4">
            The owner signs in as Super Admin with full control of every school
            in this organization.
          </p>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="owner_name"
                label="Full name"
                rules={nameRules()}
              >
                <Input placeholder="e.g. Ahmed Khan" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="owner_email" label="Email" rules={emailRules}>
                <Input placeholder="owner@example.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="owner_password"
                label="Temporary password"
                rules={passwordRules}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="owner_confirm"
                label="Confirm password"
                dependencies={['owner_password']}
                rules={confirmRules('owner_password')}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className={show(2)}>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="school_name"
                label="School name"
                rules={nameRules('the school name')}
              >
                <Input placeholder="e.g. Green Valley High School" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="emis_code"
                label="EMIS code"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: 'Please enter the EMIS code',
                  },
                  { max: 50, message: 'At most 50 characters' },
                ]}
              >
                <Input placeholder="e.g. 11635" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="uc_name"
                label="Union council"
                rules={nameRules('the union council')}
              >
                <Input placeholder="e.g. UC-5 Central" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="address" label="Address">
                <Input.TextArea
                  rows={2}
                  maxLength={255}
                  placeholder="Optional"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className={show(3)}>
          <Form.Item
            name="create_admin"
            label="Create a separate school admin"
            valuePropName="checked"
            extra="Skip this if the owner will run the school themselves — the owner already has every admin right."
          >
            <Switch aria-label="Create a separate school admin" />
          </Form.Item>
          {createAdmin && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="admin_name"
                  label="Full name"
                  rules={nameRules()}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="admin_email" label="Email" rules={emailRules}>
                  <Input placeholder="admin@example.com" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="admin_password"
                  label="Temporary password"
                  rules={passwordRules}
                >
                  <Input.Password autoComplete="new-password" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="admin_confirm"
                  label="Confirm password"
                  dependencies={['admin_password']}
                  rules={confirmRules('admin_password')}
                >
                  <Input.Password autoComplete="new-password" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </div>

        <div className={show(4)}>{step === 4 && review()}</div>
      </Form>
    </Modal>
  );
}
