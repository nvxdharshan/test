const items = [
  {
    text: 'Cybersecurity Consulting',
    href: 'service-single.html',
    children: [
      {
        text: 'Security Program Development',
        href: 'service-single.html',
        children: [
          {
            text: 'Cybersecurity Strategy & Roadmap Development',
            href: 'service-single.html',
          },
          {
            text: 'Cybersecurity Maturity Assessments',
            href: 'service-single.html',
          },
          {
            text: 'Policy & Procedure Development',
            href: 'service-single.html',
          },
        ],
      },
      {
        text: 'Risk, Compliance & Governance',
        href: 'service-single.html',
        children: [
          {
            text: 'Enterprise Risk Assessments & Gap Analysis',
            href: 'service-single.html',
          },
          {
            text: 'ISO 27001 ISMS Design & Implementation',
            href: 'service-single.html',
          },
          {
            text: 'Regulatory Compliance (e.g., GDPR, HIPAA, PCI-DSS)',
            href: 'service-single.html',
          },
          {
            text: 'Audit Preparation & Readiness',
            href: 'service-single.html',
          },
          { text: 'GRC Framework Implementation', href: 'service-single.html' },
        ],
      },
      {
        text: 'CISO Advisory',
        href: 'service-single.html',
        children: [
          {
            text: 'Virtual CISO (vCISO) Services',
            href: 'service-single.html',
          },
          {
            text: 'Board & Executive Security Advisory',
            href: 'service-single.html',
          },
          {
            text: 'Leadership-Level Security Awareness',
            href: 'service-single.html',
          },
        ],
      },
      /* This service will taken later */
      /* {
        text: 'Cloud & Digital Security',
        href: 'service-single.html',
        children: [
          { text: 'Cloud Security Architecture', href: 'service-single.html' },
          { text: 'Secure DevOps & CI/CD', href: 'service-single.html' },
        ],
      }, */
    ],
  },
  {
    text: 'Managed Security Services',
    href: 'service-single.html',
    children: [
      {
        text: 'SOC-as-a-Service',
        href: 'service-single.html',
      },
      {
        text: 'MDR',
        href: 'service-single.html',
      },
      {
        text: 'Network & Endpoint Management',
        href: 'service-single.html',
      },
      {
        text: 'Vulnerability Management',
        href: 'service-single.html',
      },
      {
        text: 'Cloud Security Management',
        href: 'service-single.html',
      },
      /* {
        text: 'IAM as a Service',
        href: 'service-single.html',
      }, */
    ],
  },
  {
    text: 'Offensive Security',
    href: 'service-single.html',
    children: [
      {
        text: 'Penetration Testing',
        href: 'service-single.html',
      },
      {
        text: 'Adversary Simulation',
        href: 'service-single.html',
      },
      {
        text: 'Vulnerability Testing',
        href: 'service-single.html',
      },
    ],
  },
  {
    text: 'Incident Response & Forensics',
    href: 'service-single.html',
    children: [
      {
        text: 'Incident Response',
        href: 'service-single.html',
      },
      {
        text: 'Digital Forensics',
        href: 'service-single.html',
      },
      {
        text: 'BCP & Crisis Mgmt',
        href: 'service-single.html',
      },
    ],
  },
  {
    text: 'Security Training & Awareness',
    href: 'service-single.html',
    children: [
      {
        text: 'Awareness Programs',
        href: 'service-single.html',
      },
      {
        text: 'Cyber Preparedness',
        href: 'service-single.html',
      },
    ],
  },
];
function renderList(items) {
  const ul = document.createElement('ul');

  items.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.classList.add('nav-link');
    a.href = item.href || '#';
    a.textContent = item.text;
    a.href = item.href || '#';
    li.appendChild(a);

    if (item.children && item.children.length > 0) {
      li.appendChild(renderList(item.children));
    }

    ul.appendChild(li);
  });

  return ul;
}

document.getElementById('services-list').appendChild(renderList(items));
