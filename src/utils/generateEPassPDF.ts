import { jsPDF } from 'jspdf';

export interface TeamMemberData {
  full_name: string;
  roll_number?: string;
  phone?: string;
  college?: string;
}

export interface EPassData {
  registration_number: string;
  event_name: string;
  event_type?: string;
  category_name?: string;
  registration_type?: string;
  participant_name: string;
  email?: string;
  phone?: string;
  college_name: string;
  roll_number: string;
  department?: string;
  year_of_study?: string;
  gender?: string;
  team_name?: string;
  team_members?: TeamMemberData[] | string;
  venue?: string;
  event_date?: string;
  start_time?: string;
  status?: string;
  created_at?: string;
  audio_file_name?: string;
}

/**
 * Format date string safely
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' ' + d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

/**
 * Normalizes team members into array
 */
function normalizeTeamMembers(raw?: TeamMemberData[] | string): TeamMemberData[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Generates an official, strictly single-page PDF containing only the participant's
 * registered data and the generated E-Pass Number.
 */
export function generateEPassPDF(data: EPassData): jsPDF {
  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  const teamMembers = normalizeTeamMembers(data.team_members);
  const isTeam = (data.registration_type || '').toLowerCase() === 'team' || Boolean(data.team_name) || teamMembers.length > 0;
  const memberCount = teamMembers.length;

  // Outer framing border
  doc.setDrawColor(30, 41, 59); // slate-800
  doc.setLineWidth(0.6);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(99, 102, 241); // indigo-500 inner thin border
  doc.setLineWidth(0.2);
  doc.rect(9.5, 9.5, pageWidth - 19, pageHeight - 19);

  let curY = 16;

  // ── Header Section ────────────────────────────────────────────────────────
  // College & Festival Banner
  doc.setFillColor(15, 23, 42); // slate-900 background
  doc.roundedRect(marginX, curY, contentWidth, 24, 2, 2, 'F');

  // Top color accent bar
  doc.setFillColor(124, 58, 237); // purple-600
  doc.rect(marginX, curY, contentWidth / 2, 1.8, 'F');
  doc.setFillColor(249, 115, 22); // orange-500
  doc.rect(marginX + contentWidth / 2, curY, contentWidth / 2, 1.8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('R.V.R. & J.C. COLLEGE OF ENGINEERING', pageWidth / 2, curY + 8.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Chandramoulipuram, Chowdavaram, Guntur, Andhra Pradesh - 522019', pageWidth / 2, curY + 13.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(245, 158, 11); // amber-400
  doc.text('COLORIDO 2K26 — OFFICIAL REGISTRATION E-PASS', pageWidth / 2, curY + 20, { align: 'center' });

  curY += 27;

  // ── Prominent E-Pass Number Banner ────────────────────────────────────────
  const bannerHeight = 16;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(199, 210, 254); // indigo-200
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, curY, contentWidth, bannerHeight, 2, 2, 'FD');

  // Left side: Registration Number
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('E-PASS / REGISTRATION NUMBER', marginX + 5, curY + 5.5);

  doc.setTextColor(30, 27, 75); // indigo-950
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(data.registration_number || 'CD26000000', marginX + 5, curY + 12);

  // Right side: Status and Registered On
  const rightX = marginX + contentWidth - 5;
  doc.setFillColor(220, 252, 231); // emerald-100
  doc.setDrawColor(134, 239, 172); // emerald-300
  doc.roundedRect(rightX - 38, curY + 2.5, 38, 5.5, 1, 1, 'FD');
  doc.setTextColor(21, 128, 61); // emerald-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`STATUS: ${(data.status || 'CONFIRMED').toUpperCase()}`, rightX - 19, curY + 6.3, { align: 'center' });

  if (data.created_at) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Registered: ${formatDate(data.created_at)}`, rightX, curY + 12.5, { align: 'right' });
  }

  curY += bannerHeight + 4;

  // Helper for drawing section header
  const drawSectionTitle = (title: string, yPos: number) => {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(marginX, yPos, contentWidth, 5.5, 'F');
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.line(marginX, yPos + 5.5, marginX + contentWidth, yPos + 5.5);

    doc.setFillColor(79, 70, 229); // indigo-600 indicator block
    doc.rect(marginX, yPos, 2.5, 5.5, 'F');

    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(title.toUpperCase(), marginX + 5, yPos + 4);
    return yPos + 8;
  };

  // ── Section 1: Registered Event Details ──────────────────────────────────
  curY = drawSectionTitle('1. Registered Event Details', curY);

  const eventBoxHeight = data.venue || data.event_date ? 17 : 12;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(marginX, curY - 2, contentWidth, eventBoxHeight, 'S');

  // Row 1
  const col1X = marginX + 4;
  const col2X = marginX + contentWidth / 2 + 2;

  // Event Name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Event Name:', col1X, curY + 2.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.event_name || 'N/A', col1X + 24, curY + 2.5);

  // Registration Type
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Registration Type:', col2X, curY + 2.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(isTeam ? 194 : 15, isTeam ? 65 : 23, isTeam ? 12 : 42);
  doc.text(isTeam ? 'Team Participation' : 'Individual Participation', col2X + 28, curY + 2.5);

  // Category / Event Type
  let categoryLabel = data.category_name || '';
  if (!categoryLabel && data.event_type) {
    const t = data.event_type.toLowerCase();
    if (t.includes('boy')) categoryLabel = 'Boys Sports';
    else if (t.includes('girl')) categoryLabel = 'Girls Sports';
    else categoryLabel = 'Cultural';
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Category:', col1X, curY + 7.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(categoryLabel || 'General', col1X + 24, curY + 7.5);

  // Venue / Date if actually in database
  if (data.venue || data.event_date) {
    if (data.venue) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Venue:', col2X, curY + 7.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(data.venue, col2X + 28, curY + 7.5);
    }
    if (data.event_date) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Schedule:', col1X, curY + 12.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const scheduleStr = data.start_time ? `${data.event_date} (${data.start_time})` : data.event_date;
      doc.text(scheduleStr, col1X + 24, curY + 12.5);
    }
  }

  curY += eventBoxHeight + 3;

  // ── Section 2: Registered Participant / Leader Details ────────────────────
  const participantTitle = isTeam ? '2. Registered Participant (Team Captain / Primary Registrant)' : '2. Registered Participant Details';
  curY = drawSectionTitle(participantTitle, curY);

  // Intelligent scaling: calculate available space based on team size
  const maxTableRows = isTeam ? memberCount : 0;
  // If many members, use slightly tighter participant box
  const compactMode = maxTableRows > 6;
  const pRowHeight = compactMode ? 4.8 : 5.8;
  const pBoxHeight = compactMode ? (data.audio_file_name ? 27 : 22) : (data.audio_file_name ? 32 : 26);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(marginX, curY - 2, contentWidth, pBoxHeight, 'S');

  let py = curY + 2.5;

  // Row 1: Name & Roll Number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Full Name:', col1X, py);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.participant_name || 'N/A', col1X + 24, py);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Student ID / Roll No:', col2X, py);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.roll_number || 'N/A', col2X + 32, py);

  py += pRowHeight;

  // Row 2: College & Department
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('College / Inst.:', col1X, py);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  // Truncate long college names cleanly
  const collegeStr = (data.college_name || 'N/A').length > 34 ? (data.college_name || '').slice(0, 32) + '...' : (data.college_name || 'N/A');
  doc.text(collegeStr, col1X + 24, py);

  if (data.department) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Department:', col2X, py);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(data.department, col2X + 32, py);
  }

  py += pRowHeight;

  // Row 3: Email & Phone
  if (data.email) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Email Address:', col1X, py);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(data.email, col1X + 24, py);
  }

  if (data.phone) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Mobile Number:', col2X, py);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(data.phone, col2X + 32, py);
  }

  py += pRowHeight;

  // Row 4: Year of Study & Gender (if entered)
  const metaParts: string[] = [];
  if (data.year_of_study) metaParts.push(`Year: ${data.year_of_study}`);
  if (data.gender) metaParts.push(`Gender: ${data.gender}`);
  if (metaParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Details:', col1X, py);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(metaParts.join('  •  '), col1X + 24, py);
  }

  // Uploaded audio track (if registered for performance)
  if (data.audio_file_name) {
    py += pRowHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Audio Track:', col1X, py);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text(data.audio_file_name, col1X + 24, py);
  }

  curY += pBoxHeight + 3;

  // ── Section 3: Registered Team Members (ONLY IF TEAM REGISTRATION) ─────────
  if (isTeam && (data.team_name || teamMembers.length > 0)) {
    curY = drawSectionTitle('3. Registered Team Information & Members', curY);

    // Team summary line
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, curY - 2, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Team Name: ${data.team_name || 'N/A'}`, marginX + 3, curY + 2.2);

    const totalCount = teamMembers.length > 0 ? teamMembers.length : 1;
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Total Registered Members: ${totalCount}`, marginX + contentWidth - 3, curY + 2.2, { align: 'right' });

    curY += 6.5;

    if (teamMembers.length > 0) {
      // Table Header
      // Intelligent row heights to guarantee single-page fit:
      // A4 has 297mm. Current Y is ~110mm.
      // Remaining page space: ~187mm.
      // Footer requires ~25mm.
      // Available for table: ~150mm.
      const tableRowHeight = memberCount > 10 ? 4.8 : memberCount > 6 ? 5.6 : 6.8;
      const tableFontSize = memberCount > 10 ? 7 : memberCount > 6 ? 7.5 : 8;

      const thHeight = 6;
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(marginX, curY, contentWidth, thHeight, 'F');

      const colW = {
        idx: 10,
        name: 50,
        roll: 34,
        phone: 30,
        college: contentWidth - (10 + 50 + 34 + 30), // 58mm
      };

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);

      let tx = marginX;
      doc.text('#', tx + colW.idx / 2, curY + 4.2, { align: 'center' });
      tx += colW.idx;
      doc.text('MEMBER NAME', tx + 2, curY + 4.2);
      tx += colW.name;
      doc.text('ROLL NO / ID', tx + 2, curY + 4.2);
      tx += colW.roll;
      doc.text('PHONE', tx + 2, curY + 4.2);
      tx += colW.phone;
      doc.text('COLLEGE', tx + 2, curY + 4.2);

      curY += thHeight;

      // Table Rows
      teamMembers.forEach((m, idx) => {
        const isEven = idx % 2 === 0;
        doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
        doc.rect(marginX, curY, contentWidth, tableRowHeight, 'F');

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.15);
        doc.line(marginX, curY + tableRowHeight, marginX + contentWidth, curY + tableRowHeight);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(tableFontSize);
        doc.setTextColor(51, 65, 85);

        let rx = marginX;
        doc.text(String(idx + 1), rx + colW.idx / 2, curY + tableRowHeight * 0.7, { align: 'center' });
        rx += colW.idx;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        const nameVal = (m.full_name || 'Member').length > 25 ? (m.full_name || '').slice(0, 23) + '..' : (m.full_name || 'Member');
        doc.text(nameVal, rx + 2, curY + tableRowHeight * 0.7);
        rx += colW.name;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(m.roll_number || '—', rx + 2, curY + tableRowHeight * 0.7);
        rx += colW.roll;

        doc.text(m.phone || '—', rx + 2, curY + tableRowHeight * 0.7);
        rx += colW.phone;

        const collVal = (m.college || data.college_name || '—').length > 32
          ? (m.college || data.college_name || '').slice(0, 30) + '..'
          : (m.college || data.college_name || '—');
        doc.text(collVal, rx + 2, curY + tableRowHeight * 0.7);

        curY += tableRowHeight;
      });

      curY += 4;
    }
  }

  // ── Verification / Authenticity Box ───────────────────────────────────────
  // Place verification box cleanly above the bottom border
  const footerBoxHeight = 18;
  const footerBoxY = Math.min(Math.max(curY + 2, 252), 262);

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(199, 210, 254); // indigo-200
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, footerBoxY, contentWidth, footerBoxHeight, 1.5, 1.5, 'FD');

  doc.setTextColor(67, 56, 202); // indigo-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OFFICIAL VERIFICATION & REPORTING NOTICE', marginX + 4, footerBoxY + 5);

  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'This computer-generated document confirms official registration for COLORIDO 2K26.',
    marginX + 4,
    footerBoxY + 9.5
  );
  doc.text(
    'Please present this E-Pass (digital copy or printout) along with your original College Identity Card upon reporting at the registration desk.',
    marginX + 4,
    footerBoxY + 14
  );

  // Bottom Security / Sign-off Line
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    `COLORIDO 2K26 • R.V.R. & J.C. College of Engineering • Pass Ref: ${data.registration_number}`,
    pageWidth / 2,
    286,
    { align: 'center' }
  );

  // ── Strict Single Page Guarantee ──────────────────────────────────────────
  // If anything inadvertently caused a second page to spawn, remove extra pages.
  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages());
  }

  return doc;
}

/**
 * Downloads the E-Pass PDF directly to user's computer.
 */
export function downloadEPassPDF(data: EPassData): void {
  const doc = generateEPassPDF(data);
  const cleanRegNo = (data.registration_number || 'EPass').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`COLORIDO_2K26_EPass_${cleanRegNo}.pdf`);
}
