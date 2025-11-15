(function () {
  'use strict';

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Command & Output demo logic
  const runBtn = document.getElementById('runBtn');
  const cmdInput = document.getElementById('cmdInput');
  const cmdOutput = document.getElementById('cmdOutput');
  runBtn?.addEventListener('click', () => {
    const value = (cmdInput?.value || '').trim();
    if (!value) {
      cmdOutput.textContent = 'Please enter a command.';
      return;
    }
    cmdOutput.textContent = [
      'Command received:',
      '',
      '$ ' + value,
      '',
      '(Note: This demo does not execute OS commands. Output is a preview.)'
    ].join('\n');
  });

  // Workflow loading and population
  const workflowSelect = document.getElementById('workflowSelect');
  const workflowStatus = document.getElementById('workflowStatus');
  const workflowList = document.getElementById('workflowList');
  const beforeEl = document.getElementById('beforeContent');
  const afterEl = document.getElementById('afterContent');

  function setWorkflowStatus(message, isError) {
    if (!workflowStatus) return;
    workflowStatus.textContent = message;
    workflowStatus.classList.toggle('text-danger', !!isError);
  }

  function populateWorkflows(items) {
    if (!workflowSelect) return;
    workflowSelect.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.disabled = true;
    ph.selected = true;
    ph.textContent = 'Select a different workflow';
    workflowSelect.appendChild(ph);

    items.forEach((wf) => {
      const opt = document.createElement('option');
      opt.value = wf.id || wf.name || '';
      opt.textContent = wf.name || wf.id || 'workflow';
      opt.dataset.description = wf.description || '';
      workflowSelect.appendChild(opt);
    });
  }

  function renderWorkflowList(items) {
    if (!workflowList) return;
    workflowList.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'list-unstyled mb-0';
    items.forEach((wf, idx) => {
      const li = document.createElement('li');
      li.className = 'mb-3';
      const link = document.createElement('a');
      link.href = 'workflows/' + wf.id + '/1';
      link.className = 'wf-link text-decoration-none';
      const nameEl = document.createElement('div');
      nameEl.className = 'wf-name fw-semibold';
      nameEl.textContent = wf.name || wf.id || 'workflow';
      const descEl = document.createElement('div');
      descEl.className = 'wf-desc text-muted small';
      descEl.textContent = wf.description || '';
      link.appendChild(nameEl);
      li.appendChild(link);
      li.appendChild(descEl);
      ul.appendChild(li);
    });
    workflowList.appendChild(ul);
  }

  // Detail pages: render list of commands for the current workflow
  const workflowCommands = document.getElementById('workflowCommands');

  function getCurrentWorkflowFromPath() {
    try {
      const parts = (location.pathname || '/').split('/').filter(Boolean);
      const idx = parts.indexOf('workflows');
      if (idx >= 0 && parts.length > idx + 1) {
        return parts[idx + 1];
      }
    } catch (_) {}
    return '';
  }

  function renderWorkflowCommands(workflow, steps) {
    if (!workflowCommands) return;
    workflowCommands.innerHTML = '';
    if (!Array.isArray(steps) || steps.length === 0) {
      const div = document.createElement('div');
      div.className = 'text-muted small';
      div.textContent = 'No commands found for this workflow.';
      workflowCommands.appendChild(div);
      return;
    }
    const ctx = getCurrentWorkflowFromPath();
    const ul = document.createElement('ul');
    ul.className = 'list-unstyled mb-0';
    steps.forEach((step, i) => {
      const li = document.createElement('li');
      li.className = 'mb-3';
      const link = document.createElement('a');
      link.href = 'workflows/' + workflow + '/' + (i + 1);
      link.className = 'wf-link text-decoration-none';
      const nameEl = document.createElement('div');
      nameEl.className = 'wf-name fw-semibold';
      nameEl.textContent = step.name || ('Step ' + (i + 1));
      const cmdEl = document.createElement('div');
      cmdEl.className = 'wf-desc text-muted small';
      cmdEl.textContent = (step.command || '').toString();
      link.appendChild(nameEl);
      li.appendChild(link);
      li.appendChild(cmdEl);
      if (ctx && ctx.workflow === workflow && ctx.step === (i + 1)) {
        li.classList.add('active');
      }
      ul.appendChild(li);
    });
    workflowCommands.appendChild(ul);
  }

  (async function initWorkflowCommands() {
    if (!workflowCommands) return;
    const workflow = getCurrentWorkflowFromPath();
    if (!workflow) {
      renderWorkflowCommands('', []);
      return;
    }
    try {
      const res = await fetch('workflows/' + workflow + '/steps.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const steps = await res.json();
      renderWorkflowCommands(workflow, steps);
    } catch (err) {
      renderWorkflowCommands('', []);
    }
  })();
  function renderBeforeAfter(name, description) {
    const text = 'Workflow: ' + (name || '-') + '\n\n' + (description || 'No description available.');
    if (beforeEl) {
      beforeEl.innerHTML = '';
      const pre = document.createElement('pre');
      pre.className = 'bg-light border rounded p-3';
      pre.textContent = text;
      beforeEl.appendChild(pre);
    }
    if (afterEl) {
      afterEl.innerHTML = '';
      const pre = document.createElement('pre');
      pre.className = 'bg-light border rounded p-3';
      pre.textContent = text;
      afterEl.appendChild(pre);
    }
  }

  workflowSelect?.addEventListener('change', (e) => {
    const value = e.target.value || '';
    if (value) {
      // Navigate to the first step of the selected workflow
      window.location.href = 'workflows/' + value + '/1/';
    }
  });

  (async function initWorkflows() {
    try {
      setWorkflowStatus('Fetching workflows…');
      const res = await fetch('workflows.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.workflows || []);
      if (!Array.isArray(list) || list.length === 0) {
        setWorkflowStatus('No workflows found.', true);
        populateWorkflows([]);
        renderWorkflowList([]);
        return;
      }
      populateWorkflows(list);
      renderWorkflowList(list);
      setWorkflowStatus('Loaded ' + list.length + ' workflows.');
    } catch (err) {
      setWorkflowStatus('Failed to load workflows: ' + (err && err.message ? err.message : 'Unknown error'), true);
      populateWorkflows([]);
      renderWorkflowList([]);
    }
  })();
})();

// Navigation actions for terminal header
(function () {
  const navPrev = document.getElementById('navPrev');
  const navNext = document.getElementById('navNext');

  function getWorkflowAndStep() {
    try {
      const parts = (location.pathname || '/').split('/').filter(Boolean);
      const idx = parts.indexOf('workflows');
      if (idx >= 0 && parts.length > idx + 2) {
        const workflow = parts[idx + 1];
        const stepStr = parts[idx + 2];
        const step = parseInt(stepStr, 10);
        if (!Number.isNaN(step) && step > 0) {
          return { workflow, step };
        }
      }
    } catch (_) {}
    return { workflow: '', step: 0 };
  }

  async function setupNav() {
    if (!navPrev && !navNext) return;
    const { workflow, step } = getWorkflowAndStep();
    if (!workflow || !step) {
      // No-op if not on a workflow step page
      if (navPrev) { navPrev.disabled = true; navPrev.classList.add('disabled'); }
      if (navNext) { navNext.disabled = true; navNext.classList.add('disabled'); }
      return;
    }
    let maxSteps = 0;
    try {
      const res = await fetch('workflows/' + workflow + '/steps.json', { cache: 'no-store' });
      if (res.ok) {
        const steps = await res.json();
        if (Array.isArray(steps)) maxSteps = steps.length;
      }
    } catch (_) {}

    const prevStep = step - 1;
    const nextStep = step + 1;

    if (navPrev) {
      if (prevStep >= 1) {
        navPrev.disabled = false;
        navPrev.classList.remove('disabled');
        navPrev.onclick = () => { window.location.href = 'workflows/' + workflow + '/' + prevStep + '/'; };
      } else {
        navPrev.disabled = true;
        navPrev.classList.add('disabled');
        navPrev.onclick = null;
      }
    }
    if (navNext) {
      if (maxSteps > 0 && nextStep <= maxSteps) {
        navNext.disabled = false;
        navNext.classList.remove('disabled');
        navNext.onclick = () => { window.location.href = 'workflows/' + workflow + '/' + nextStep + '/'; };
      } else {
        navNext.disabled = true;
        navNext.classList.add('disabled');
        navNext.onclick = null;
      }
    }
  }

  setupNav();
})();

