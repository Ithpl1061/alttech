const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf-8');

const marker1 = `const currentPath = window.location.pathname.replace(/^\\//, '')`;
const marker2 = `    event.preventDefault()`;

const parts = content.split(marker1);
if (parts.length < 2) {
    console.log('Marker 1 not found');
    process.exit(1);
}

const subparts = parts[1].split(marker2);
if (subparts.length < 2) {
    console.log('Marker 2 not found');
    process.exit(1);
}

const replacement = `
      let nextPage = currentPath === 'login' || currentPath === 'signup' ? 'list' : currentPath
      
      if (nextPage === 'review') {
        const params = new URLSearchParams(window.location.search)
        const rId = params.get('reportId')
        const sId = params.get('reqId')
        if (rId && sId) {
          try {
            const complete = await api.getReport(rId, { force: true })
            if (active) {
              setReport(complete.data)
              setActiveReportId(complete.id)
              setActiveSampleRequestId(sId)
              setPreviewReady(true)
            }
          } catch(e) {
            if (active) nextPage = 'workflow'
          }
        } else {
          nextPage = 'workflow'
        }
      }
      if (active) setPage(nextPage || 'list')
    }).catch(() => {
      if (active) setPage('login')
    }).finally(() => {
      if (active) setAppLoading(false)
    })
    return () => { active = false }
  }, [])

  const downloadPdf = async () => { if (!activeReportId) return; setPdfLoading(true); setAppError(''); try { const { blob, filename } = await api.downloadPdf(activeReportId); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url) } catch (error) { setAppError(error.message) } finally { setPdfLoading(false) } }

  const changeTemplateField = (key, value) => { setTemplate((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })); }
  const changeTemplateTest = (index, key, value) => {
    setTemplate((current) => ({ ...current, tests: current.tests.map((test, rowIndex) => rowIndex === index ? { ...test, [key]: value } : test) }))
    setErrors((current) => ({ ...current, [\`test-\${index}-\${key}\`]: undefined, tests: undefined }));
  }
  const addTemplateRow = () => { setTemplate((current) => ({ ...current, tests: [...current.tests, { parameter: '', method: '', unit: '', remark: '' }] })); }
  const removeTemplateRow = (index) => { setTemplate((current) => ({ ...current, tests: current.tests.filter((_, rowIndex) => rowIndex !== index) })); }
  const openNewTemplate = () => { setTemplate(createBlankTemplate()); setActiveTemplateId(null); setErrors({}); setAppError(''); setPage('template-form') }
  const openEditTemplate = async (saved) => { try { const complete = await api.getTemplate(saved.id, { force: true }); setTemplate(copyTemplate(complete.data)); setActiveTemplateId(complete.id); setErrors({}); setPage('template-form') } catch (error) { setAppError(error.message) } }
  const deleteTemplate = async (id) => { if (!window.confirm('Delete this template?')) return; try { await api.deleteTemplate(id); setTemplates(await api.listTemplates({ force: true })) } catch (error) { setAppError(error.message) } }
  const onSaveTemplate = async (event) => {
`;

const newContent = parts[0] + marker1 + replacement + marker2 + subparts.slice(1).join(marker2);
fs.writeFileSync('src/App.jsx', newContent);
console.log('Fixed App.jsx');
