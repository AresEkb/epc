package epc.design;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.eclipse.emf.common.util.BasicMonitor;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.sirius.business.api.action.AbstractExternalJavaAction;
import org.eclipse.sirius.viewpoint.DSemanticDecorator;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.DirectoryDialog;
import org.eclipse.ui.PlatformUI;

import epc.codegen.main.GenerateDoc;

public class ExportAsHtml extends AbstractExternalJavaAction {

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
        var dialog = new DirectoryDialog(shell, SWT.OPEN);
        String folderName = dialog.open();

        var item = (DSemanticDecorator) obj;
        var model = item.getTarget().eResource().getContents().get(0);
        try {
            var generator = new GenerateDoc(model, new File(folderName), List.of());
            generator.doGenerate(new BasicMonitor());
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

}
