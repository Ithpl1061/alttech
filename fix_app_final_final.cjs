const fs = require('fs');
let lines = fs.readFileSync('frontend/src/App.jsx', 'utf8').split(/\\r?\\n/);

const replacement = [
  "        } else {",
  "          nextPage = 'workflow'",
  "        }",
  "      }",
  "      ",
  "      if (active) setPage(nextPage)",
  "      setReportsLoading(true)",
  "      try { setReports(await api.listReports({ force: true })); setTemplates(await api.listTemplates({ force: true })); setSampleRequests(await api.listSampleRequests({ force: true })); setNotifications(await api.getNotifications()); } catch (error) { if (active) setAppError(error.message) } finally { if (active) setReportsLoading(false) }",
  "    }).catch(() => { if (active) setPage('login') }).finally(() => { if (active) setAppLoading(false) })",
  "    return () => { active = false }",
  "  }, [])",
  "  const refreshReports = async () => { setReportsLoading(true); setAppError(''); try { setReports(await api.listReports({ force: true, from: dateFilter.from, to: dateFilter.to })); setTemplates(await api.listTemplates({ force: true })); setSampleRequests(await api.listSampleRequests({ force: true, from: dateFilter.from, to: dateFilter.to })); setNotifications(await api.getNotifications()); } catch (error) { setAppError(error.message); throw error } finally { setReportsLoading(false) } }",
  "  const handleLogin = async (values) => { setCurrentUser(await api.login(values)); await refreshReports(); setPage('list') }",
  "  const handleSignup = async (values) => { await api.signup(values) }",
  "  const changeField = (key, value) => { setReport((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })); setValidated(false); setPreviewReady(false) }",
  "  const changeTest = (index, key, value) => {",
  "    setReport((current) => ({ ...current, tests: current.tests.map((test, rowIndex) => rowIndex === index ? { ...test, [key]: value } : test) }))",
  "    setErrors((current) => ({ ...current, ['test-' + index + '-' + key]: undefined, tests: undefined })); setValidated(false); setPreviewReady(false)",
  "  }",
  "  const addRow = () => { setReport((current) => ({ ...current, tests: [...current.tests, { parameter: '', method: '', result: '', unit: '', remark: '' }] })); setValidated(false); setPreviewReady(false) }",
  "  const removeRow = (index) => { setReport((current) => ({ ...current, tests: current.tests.filter((_, rowIndex) => rowIndex !== index) })); setValidated(false); setPreviewReady(false) }",
  "  const handleEnterResults = (req) => {",
  "    setReport({",
  "      ...createBlankReport(),",
  "      sampleRequestId: req.id,",
  "      name: req.data.customerName || '',",
  "      address: req.data.customerAddress || '',",
  "      sampleNameNo: req.data.sampleNo || '',",
  "      sampleReceiptDate: new Date(req.data.createdAt || Date.now()).toISOString().split('T')[0],",
  "      tests: (req.data.analysisRequired || []).map(param => ({ parameter: param, method: '', result: '', unit: '', remark: '' }))",
  "    });",
  "    setActiveReportId(null); setErrors({}); setAppError(''); setValidated(false); setPreviewReady(false); setPage('form')",
  "  }",
  "  const openEdit = async (savedReport) => { try { const complete = await api.getReport(savedReport.id, { force: true }); setReport(copyReport(complete.data)); setActiveReportId(complete.id); setErrors({}); setValidated(false); setPreviewReady(true); setPage('form') } catch (error) { setAppError(error.message) } }",
  "  const openPreview = async (savedReport) => { try { const complete = await api.getReport(savedReport.id, { force: true }); setReport(copyReport(complete.data)); setActiveReportId(complete.id); setErrors({}); setValidated(true); setPreviewReady(true); setPage('preview') } catch (error) { setAppError(error.message) } }",
  "  const onValidate = async (event) => {",
  "    event.preventDefault()",
  "    const nextErrors = validate(report)",
  "    const isValid = Object.keys(nextErrors).length === 0",
  "    setErrors(nextErrors)",
  "    setValidated(isValid)",
  "    if (!isValid) return",
  "    try {",
  "      const saved = activeReportId ? await api.updateReport(activeReportId, report) : await api.createReport(report)",
  "      setReport(copyReport(saved.data)); setActiveReportId(saved.id); setReports((current) => activeReportId ? current.map((savedReport) => savedReport.id === activeReportId ? saved : savedReport) : [saved, ...current]); ",
  "      if (saved.data.sampleRequestId) {",
  "        api.listSampleRequests({ force: true }).then(setSampleRequests).catch(() => {})",
  "      }",
  "      setPreviewReady(true)",
  "    } catch (error) {",
  "      const serverErrors = Object.fromEntries(Object.entries(error.errors ?? {}).map(([key, message]) => [key.replace(/^tests\\.(\\d+)\\.(.+)$/, 'test-$1-$2'), message]))",
  "      setErrors(Object.keys(serverErrors).length ? serverErrors : { form: error.message }); setValidated(false)",
  "    }",
  "  }"
];

// Find the line index of "        } else {" (line 561)
let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "        } else {" && lines[i+1] === "          nextPage = 'workflow'") {
    startIndex = i;
    break;
  }
}

if (startIndex === -1) {
  console.log("Not found.");
  process.exit(1);
}

// Find the line index of "      setErrors(Object.keys(serverErrors).length ? serverErrors : { form: error.message }); setValidated(false)"
let endIndex = startIndex;
for (let i = startIndex; i < lines.length; i++) {
  if (lines[i] === "  }") {
    endIndex = i;
    break;
  }
}

lines.splice(startIndex, endIndex - startIndex + 1, ...replacement);

fs.writeFileSync('frontend/src/App.jsx', lines.join('\\n'));
console.log('Fixed App.jsx via line replacement.');
