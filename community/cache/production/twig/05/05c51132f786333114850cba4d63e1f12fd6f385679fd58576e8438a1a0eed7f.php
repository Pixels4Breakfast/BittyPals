<?php

/* report_body.html */
class __TwigTemplate_19e3f8e5f5439e15e0ceb81eb88712df6b33c36d37c2b2432fce64132dcb3956 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        $location = "overall_header.html";
        $namespace = false;
        if (strpos($location, '@') === 0) {
            $namespace = substr($location, 1, strpos($location, '/') - 1);
            $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
            $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
        }
        $this->loadTemplate("overall_header.html", "report_body.html", 1)->display($context);
        if ($namespace) {
            $this->env->setNamespaceLookUpOrder($previous_look_up_order);
        }
        // line 2
        echo "
<h2 class=\"titlespace\">";
        // line 3
        if ((isset($context["S_REPORT_POST"]) ? $context["S_REPORT_POST"] : null)) {
            echo $this->env->getExtension('phpbb')->lang("REPORT_POST");
        } else {
            echo $this->env->getExtension('phpbb')->lang("REPORT_MESSAGE");
        }
        echo "</h2>

<form method=\"post\" action=\"";
        // line 5
        echo (isset($context["S_REPORT_ACTION"]) ? $context["S_REPORT_ACTION"] : null);
        echo "\" id=\"report\">
<div class=\"panel\">
\t<div class=\"inner\">

\t<div class=\"content\">
\t\t<p>";
        // line 10
        if ((isset($context["S_REPORT_POST"]) ? $context["S_REPORT_POST"] : null)) {
            echo $this->env->getExtension('phpbb')->lang("REPORT_POST_EXPLAIN");
        } else {
            echo $this->env->getExtension('phpbb')->lang("REPORT_MESSAGE_EXPLAIN");
        }
        echo "</p>

\t\t<fieldset>
\t\t";
        // line 13
        if ((isset($context["ERROR"]) ? $context["ERROR"] : null)) {
            echo "<dl><dd class=\"error\">";
            echo (isset($context["ERROR"]) ? $context["ERROR"] : null);
            echo "</dd></dl>";
        }
        // line 14
        echo "\t\t<dl class=\"fields2\">
\t\t\t<dt><label for=\"reason_id\">";
        // line 15
        echo $this->env->getExtension('phpbb')->lang("REASON");
        echo $this->env->getExtension('phpbb')->lang("COLON");
        echo "</label></dt>
\t\t\t<dd><select name=\"reason_id\" id=\"reason_id\" class=\"full\">";
        // line 16
        $context['_parent'] = $context;
        $context['_seq'] = twig_ensure_traversable($this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "reason", array()));
        foreach ($context['_seq'] as $context["_key"] => $context["reason"]) {
            echo "<option value=\"";
            echo $this->getAttribute($context["reason"], "ID", array());
            echo "\"";
            if ($this->getAttribute($context["reason"], "S_SELECTED", array())) {
                echo " selected=\"selected\"";
            }
            echo ">";
            echo $this->getAttribute($context["reason"], "DESCRIPTION", array());
            echo "</option>";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['reason'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        echo "</select></dd>
\t\t</dl>
\t\t";
        // line 18
        if ((isset($context["S_CAN_NOTIFY"]) ? $context["S_CAN_NOTIFY"] : null)) {
            // line 19
            echo "\t\t\t<dl class=\"fields2\">
\t\t\t\t<dt><label for=\"notify1\">";
            // line 20
            echo $this->env->getExtension('phpbb')->lang("REPORT_NOTIFY");
            echo $this->env->getExtension('phpbb')->lang("COLON");
            echo "</label><br /><span>";
            echo $this->env->getExtension('phpbb')->lang("REPORT_NOTIFY_EXPLAIN");
            echo "</span></dt>
\t\t\t\t<dd>
\t\t\t\t\t<label for=\"notify1\"><input type=\"radio\" name=\"notify\" id=\"notify1\" value=\"1\" ";
            // line 22
            if ( !(isset($context["S_NOTIFY"]) ? $context["S_NOTIFY"] : null)) {
                echo "checked=\"checked\"";
            }
            echo " /> ";
            echo $this->env->getExtension('phpbb')->lang("YES");
            echo "</label>
\t\t\t\t\t<label for=\"notify0\"><input type=\"radio\" name=\"notify\" id=\"notify0\" value=\"0\" ";
            // line 23
            if ((isset($context["S_NOTIFY"]) ? $context["S_NOTIFY"] : null)) {
                echo "checked=\"checked\"";
            }
            echo " /> ";
            echo $this->env->getExtension('phpbb')->lang("NO");
            echo "</label>
\t\t\t\t</dd>
\t\t\t</dl>
\t\t";
        }
        // line 27
        echo "\t\t<dl class=\"fields2\">
\t\t\t<dt><label for=\"report_text\">";
        // line 28
        echo $this->env->getExtension('phpbb')->lang("MORE_INFO");
        echo $this->env->getExtension('phpbb')->lang("COLON");
        echo "</label><br /><span>";
        echo $this->env->getExtension('phpbb')->lang("CAN_LEAVE_BLANK");
        echo "</span></dt>
\t\t\t<dd><textarea name=\"report_text\" id=\"report_text\" rows=\"10\" cols=\"76\" class=\"inputbox\">";
        // line 29
        echo (isset($context["REPORT_TEXT"]) ? $context["REPORT_TEXT"] : null);
        echo "</textarea></dd>
\t\t</dl>
\t\t";
        // line 31
        if ((isset($context["CAPTCHA_TEMPLATE"]) ? $context["CAPTCHA_TEMPLATE"] : null)) {
            // line 32
            echo "\t\t\t";
            $location = (("" . (isset($context["CAPTCHA_TEMPLATE"]) ? $context["CAPTCHA_TEMPLATE"] : null)) . "");
            $namespace = false;
            if (strpos($location, '@') === 0) {
                $namespace = substr($location, 1, strpos($location, '/') - 1);
                $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
                $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
            }
            $this->loadTemplate((("" . (isset($context["CAPTCHA_TEMPLATE"]) ? $context["CAPTCHA_TEMPLATE"] : null)) . ""), "report_body.html", 32)->display($context);
            if ($namespace) {
                $this->env->setNamespaceLookUpOrder($previous_look_up_order);
            }
            // line 33
            echo "\t\t";
        }
        // line 34
        echo "\t\t</fieldset>
\t</div>

\t</div>
</div>

<div class=\"panel\">
\t<div class=\"inner\">

\t<div class=\"content\">
\t\t<fieldset class=\"submit-buttons\">
\t\t\t<input type=\"submit\" name=\"submit\" class=\"button1\" value=\"";
        // line 45
        echo $this->env->getExtension('phpbb')->lang("SUBMIT");
        echo "\" />&nbsp;
\t\t\t<input type=\"submit\" name=\"cancel\" class=\"button2\" value=\"";
        // line 46
        echo $this->env->getExtension('phpbb')->lang("CANCEL");
        echo "\" />
\t\t\t";
        // line 47
        echo (isset($context["S_FORM_TOKEN"]) ? $context["S_FORM_TOKEN"] : null);
        echo "
\t\t</fieldset>
\t</div>

\t</div>
</div>
</form>

";
        // line 55
        $location = "overall_footer.html";
        $namespace = false;
        if (strpos($location, '@') === 0) {
            $namespace = substr($location, 1, strpos($location, '/') - 1);
            $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
            $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
        }
        $this->loadTemplate("overall_footer.html", "report_body.html", 55)->display($context);
        if ($namespace) {
            $this->env->setNamespaceLookUpOrder($previous_look_up_order);
        }
    }

    public function getTemplateName()
    {
        return "report_body.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  192 => 55,  181 => 47,  177 => 46,  173 => 45,  160 => 34,  157 => 33,  144 => 32,  142 => 31,  137 => 29,  130 => 28,  127 => 27,  116 => 23,  108 => 22,  100 => 20,  97 => 19,  95 => 18,  75 => 16,  70 => 15,  67 => 14,  61 => 13,  51 => 10,  43 => 5,  34 => 3,  31 => 2,  19 => 1,);
    }
}
/* <!-- INCLUDE overall_header.html -->*/
/* */
/* <h2 class="titlespace"><!-- IF S_REPORT_POST -->{L_REPORT_POST}<!-- ELSE -->{L_REPORT_MESSAGE}<!-- ENDIF --></h2>*/
/* */
/* <form method="post" action="{S_REPORT_ACTION}" id="report">*/
/* <div class="panel">*/
/* 	<div class="inner">*/
/* */
/* 	<div class="content">*/
/* 		<p><!-- IF S_REPORT_POST -->{L_REPORT_POST_EXPLAIN}<!-- ELSE -->{L_REPORT_MESSAGE_EXPLAIN}<!-- ENDIF --></p>*/
/* */
/* 		<fieldset>*/
/* 		<!-- IF ERROR --><dl><dd class="error">{ERROR}</dd></dl><!-- ENDIF -->*/
/* 		<dl class="fields2">*/
/* 			<dt><label for="reason_id">{L_REASON}{L_COLON}</label></dt>*/
/* 			<dd><select name="reason_id" id="reason_id" class="full"><!-- BEGIN reason --><option value="{reason.ID}"<!-- IF reason.S_SELECTED --> selected="selected"<!-- ENDIF -->>{reason.DESCRIPTION}</option><!-- END reason --></select></dd>*/
/* 		</dl>*/
/* 		<!-- IF S_CAN_NOTIFY -->*/
/* 			<dl class="fields2">*/
/* 				<dt><label for="notify1">{L_REPORT_NOTIFY}{L_COLON}</label><br /><span>{L_REPORT_NOTIFY_EXPLAIN}</span></dt>*/
/* 				<dd>*/
/* 					<label for="notify1"><input type="radio" name="notify" id="notify1" value="1" <!-- IF not S_NOTIFY -->checked="checked"<!-- ENDIF --> /> {L_YES}</label>*/
/* 					<label for="notify0"><input type="radio" name="notify" id="notify0" value="0" <!-- IF S_NOTIFY -->checked="checked"<!-- ENDIF --> /> {L_NO}</label>*/
/* 				</dd>*/
/* 			</dl>*/
/* 		<!-- ENDIF -->*/
/* 		<dl class="fields2">*/
/* 			<dt><label for="report_text">{L_MORE_INFO}{L_COLON}</label><br /><span>{L_CAN_LEAVE_BLANK}</span></dt>*/
/* 			<dd><textarea name="report_text" id="report_text" rows="10" cols="76" class="inputbox">{REPORT_TEXT}</textarea></dd>*/
/* 		</dl>*/
/* 		<!-- IF CAPTCHA_TEMPLATE -->*/
/* 			<!-- INCLUDE {CAPTCHA_TEMPLATE} -->*/
/* 		<!-- ENDIF -->*/
/* 		</fieldset>*/
/* 	</div>*/
/* */
/* 	</div>*/
/* </div>*/
/* */
/* <div class="panel">*/
/* 	<div class="inner">*/
/* */
/* 	<div class="content">*/
/* 		<fieldset class="submit-buttons">*/
/* 			<input type="submit" name="submit" class="button1" value="{L_SUBMIT}" />&nbsp;*/
/* 			<input type="submit" name="cancel" class="button2" value="{L_CANCEL}" />*/
/* 			{S_FORM_TOKEN}*/
/* 		</fieldset>*/
/* 	</div>*/
/* */
/* 	</div>*/
/* </div>*/
/* </form>*/
/* */
/* <!-- INCLUDE overall_footer.html -->*/
/* */
