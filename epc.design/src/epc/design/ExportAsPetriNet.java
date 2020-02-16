package epc.design;

import java.io.File;
import java.io.OutputStreamWriter;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.emf.common.util.BasicDiagnostic;
import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.xmi.XMLResource;
import org.eclipse.m2m.qvt.oml.BasicModelExtent;
import org.eclipse.m2m.qvt.oml.ExecutionContextImpl;
import org.eclipse.m2m.qvt.oml.TransformationExecutor;
import org.eclipse.m2m.qvt.oml.util.WriterLog;
import org.eclipse.sirius.business.api.action.AbstractExternalJavaAction;
import org.eclipse.sirius.viewpoint.DSemanticDecorator;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.FileDialog;
import org.eclipse.ui.PlatformUI;
import org.pnml.tools.epnk.pnmlcoremodel.PnmlcoremodelPackage;

public class ExportAsPetriNet extends AbstractExternalJavaAction {

    @Override
    public boolean canExecute(Collection<? extends EObject> selections) {
        return true;
    }

    @Override
    public void execute(Collection<? extends EObject> selections, Map<String, Object> parameters) {
        if (selections.size() == 0) {
            System.err.println("Selection is empty");
            return;
        }
        var obj = selections.iterator().next();
        if (!(obj instanceof DSemanticDecorator)) {
            System.err.println("No DSemanticDecorator found");
            return;
        }

        var shell = PlatformUI.getWorkbench().getActiveWorkbenchWindow().getShell();
        var dialog = new FileDialog(shell, SWT.OPEN);
        dialog.setFilterExtensions(new String [] {"*.pnml"});
        String fileName = dialog.open();
        if (!fileName.endsWith(".pnml")) {
            fileName += ".pnml";
        }

        var item = (DSemanticDecorator) obj;
        URI transformation = URI.createPlatformPluginURI("/epc.transform/transforms/epc/EpcToPetriNet.qvto", false);
        try {
            List<? extends EObject> result = transformModel(transformation, item.getTarget().eResource().getContents());

            PnmlcoremodelPackage.eINSTANCE.getEFactoryInstance();
            var rs = new ResourceSetImpl();
            var uri = URI.createFileURI(new File(fileName).getAbsolutePath());
            var res = rs.createResource(uri);
            res.getContents().addAll(result);
            var options = new HashMap<Object, Object>();
            options.put(XMLResource.OPTION_ENCODING, "UTF-8");
            res.save(options);
            res.unload();

//            var exporter = new PnmlExport();
//            exporter.exportObject(result.get(0), fileName, true);
        }
        catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    private static List<? extends EObject> transformModel(URI transformation, List<? extends EObject> elements) throws Exception
    {
        var executor = new TransformationExecutor(transformation);
        var context = new ExecutionContextImpl();
        context.setLog(new WriterLog(new OutputStreamWriter(System.out)));
        var input = new BasicModelExtent(elements);
        var output = new BasicModelExtent();
        var result = executor.execute(context, input, output);
        if (result.getSeverity() == Diagnostic.OK) {
            return output.getContents();
        }
        else {
            var status = BasicDiagnostic.toIStatus(result);
            for (var error : status.getChildren()) {
                System.err.println("  " + error);
            }
            throw new Exception(status.getMessage());
        }
    }

}
