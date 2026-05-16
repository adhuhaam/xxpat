import { JSDOM } from 'jsdom';

export async function POST(req) {

  try {

    const body = await req.json();

    const formData = new URLSearchParams();

    formData.append('workPermitNumber', body.wp);
    formData.append('firstName', body.search);

    const response = await fetch(
      'https://xpat.egov.mv/EmploymentApproval/EmploymentApproval/WorkPermitVerify',
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const html = await response.text();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const name =
      document.querySelector('.kt-widget__username')
        ?.textContent
        ?.trim();

    if (!name) {

      return Response.json({
        success: false,
        message: 'Employee not found'
      });

    }

    const employer =
      document.querySelector('[title="current employer"]')
        ?.textContent
        ?.trim();

    const image =
      document.querySelector('.kt-widget__media img')
        ?.src;

    const links =
      [...document.querySelectorAll('.kt-widget__subhead a')];

    const passport =
      links.find(el => el.textContent.includes('A'))
        ?.textContent
        ?.trim();

    const wp =
      links.find(el => el.textContent.includes('WP'))
        ?.textContent
        ?.trim();

    return Response.json({
      success: true,
      employee: {
        name,
        employer,
        image,
        passport,
        wp,
        status: 'Issued',
        validTill: 'Available'
      }
    });

  } catch (err) {

    return Response.json({
      success: false,
      message: 'Server error'
    });

  }

}
