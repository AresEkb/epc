package epc.design;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.eclipse.core.runtime.NullProgressMonitor;
import org.eclipse.core.runtime.Path;
import org.eclipse.emf.common.util.BasicMonitor;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.sirius.business.api.action.AbstractExternalJavaAction;
import org.eclipse.sirius.business.api.session.SessionManager;
import org.eclipse.sirius.common.tools.api.resource.ImageFileFormat;
import org.eclipse.sirius.diagram.DSemanticDiagram;
import org.eclipse.sirius.ui.business.api.dialect.DialectUIManager;
import org.eclipse.sirius.ui.business.api.dialect.ExportFormat;
import org.eclipse.sirius.ui.business.api.dialect.ExportFormat.ExportDocumentFormat;
import org.eclipse.sirius.ui.tools.api.actions.export.SizeTooLargeException;
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
        var targetFolder = new File(folderName);

        var item = (DSemanticDiagram) obj;
        var model = (epc.Model) item.getTarget().eResource().getContents().get(0);
        try {
            var generator = new GenerateDoc(model, targetFolder, List.of());
            generator.doGenerate(new BasicMonitor());
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        var session = SessionManager.INSTANCE.getSession(item);
        var exportFormat = new ExportFormat(ExportDocumentFormat.NONE, ImageFileFormat.PNG);
        var imagePath = new Path(folderName).append(toKebabCase(model.getName()) + ".png");
        try {
            DialectUIManager.INSTANCE.export(item, session, imagePath, exportFormat, new NullProgressMonitor());
        } catch (SizeTooLargeException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    private String toKebabCase(String str) {
        return str.toLowerCase().replaceAll("[^a-z0-9]+", "-");
    }

}
