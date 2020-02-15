package epc.design;

import java.io.OutputStreamWriter;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.emf.common.util.BasicDiagnostic;
import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.m2m.qvt.oml.BasicModelExtent;
import org.eclipse.m2m.qvt.oml.ExecutionContextImpl;
import org.eclipse.m2m.qvt.oml.ExecutionDiagnostic;
import org.eclipse.m2m.qvt.oml.ModelExtent;
import org.eclipse.m2m.qvt.oml.TransformationExecutor;
import org.eclipse.m2m.qvt.oml.util.WriterLog;
import org.eclipse.sirius.business.api.action.AbstractExternalJavaAction;
import org.eclipse.sirius.viewpoint.DSemanticDecorator;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.FileDialog;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.ui.PlatformUI;

import fr.lip6.move.pnml.framework.general.PnmlExport;

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
        EObject obj = selections.iterator().next();
        if (!(obj instanceof DSemanticDecorator)) {
            System.err.println("No DSemanticDecorator found");
            return;
        }

        Shell shell = PlatformUI.getWorkbench().getActiveWorkbenchWindow().getShell();
        FileDialog dialog = new FileDialog(shell, SWT.OPEN);
        dialog.setFilterExtensions(new String [] {"*.pnml"});
        String pnmlFileName = dialog.open();
        if (!pnmlFileName.endsWith(".pnml")) {
            pnmlFileName += ".pnml";
        }

        DSemanticDecorator item = (DSemanticDecorator) obj;
        System.out.println("!!!");
        System.out.println(item.getTarget().eResource().getContents().get(0));
        URI transformation = URI.createPlatformPluginURI("/epc.transform/transforms/epc/EpcToPetriNet.qvto", false);
        try {
            List<? extends EObject> result = transformModel(transformation, item.getTarget().eResource().getContents());
            System.out.println(result);
            PnmlExport exporter = new PnmlExport();
            exporter.exportObject(result.get(0), pnmlFileName, true);
        }
        catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    private static List<? extends EObject> transformModel(URI transformation, List<? extends EObject> elements) throws Exception
    {
        TransformationExecutor executor = new TransformationExecutor(transformation);
        ExecutionContextImpl context = new ExecutionContextImpl();
        context.setLog(new WriterLog(new OutputStreamWriter(System.out)));
        ModelExtent input = new BasicModelExtent(elements);
        ModelExtent output = new BasicModelExtent();
        ExecutionDiagnostic result = executor.execute(context, input, output);
        if (result.getSeverity() == Diagnostic.OK) {
            return output.getContents();
        }
        else {
            IStatus status = BasicDiagnostic.toIStatus(result);
            for (IStatus error : status.getChildren()) {
                System.err.println("  " + error);
            }
            throw new Exception(status.getMessage());
        }
    }

}
