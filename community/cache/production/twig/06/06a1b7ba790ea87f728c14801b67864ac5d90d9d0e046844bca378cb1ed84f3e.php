<?php

/* ucp_zebra_foes.html */
class __TwigTemplate_80a5c07c7cfaf13de5b841be4a82b8678016f02deaa98a304f1145656514935c extends Twig_Template
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
        $location = "ucp_header.html";
        $namespace = false;
        if (strpos($location, '@') === 0) {
            $namespace = substr($location, 1, strpos($location, '/') - 1);
            $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
            $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
        }
        $this->loadTemplate("ucp_header.html", "ucp_zebra_foes.html", 1)->display($context);
        if ($namespace) {
            $this->env->setNamespaceLookUpOrder($previous_look_up_order);
        }
        // line 2
        echo "
<form id=\"ucp\" method=\"post\" action=\"";
        // line 3
        echo (isset($context["S_UCP_ACTION"]) ? $context["S_UCP_ACTION"] : null);
        echo "\"";
        echo (isset($context["S_FORM_ENCTYPE"]) ? $context["S_FORM_ENCTYPE"] : null);
        echo ">

<h2>";
        // line 5
        echo $this->env->getExtension('phpbb')->lang("TITLE");
        echo "</h2>

<div class=\"panel\">
\t<div class=\"inner\">

\t<p>";
        // line 10
        echo $this->env->getExtension('phpbb')->lang("FOES_EXPLAIN");
        echo "</p>

\t<fieldset class=\"fields2\">
\t";
        // line 13
        if ((isset($context["ERROR"]) ? $context["ERROR"] : null)) {
            echo "<p class=\"error\">";
            echo (isset($context["ERROR"]) ? $context["ERROR"] : null);
            echo "</p>";
        }
        // line 14
        echo "\t<dl>
\t\t<dt><label ";
        // line 15
        if ((isset($context["S_USERNAME_OPTIONS"]) ? $context["S_USERNAME_OPTIONS"] : null)) {
            echo "for=\"usernames\"";
        }
        echo ">";
        echo $this->env->getExtension('phpbb')->lang("YOUR_FOES");
        echo $this->env->getExtension('phpbb')->lang("COLON");
        echo "</label><br /><span>";
        echo $this->env->getExtension('phpbb')->lang("YOUR_FOES_EXPLAIN");
        echo "</span></dt>
\t\t<dd>
\t\t\t";
        // line 17
        if ((isset($context["S_USERNAME_OPTIONS"]) ? $context["S_USERNAME_OPTIONS"] : null)) {
            // line 18
            echo "\t\t\t\t<select name=\"usernames[]\" id=\"usernames\" multiple=\"multiple\" size=\"5\">";
            echo (isset($context["S_USERNAME_OPTIONS"]) ? $context["S_USERNAME_OPTIONS"] : null);
            echo "</select>
\t\t\t";
        } else {
            // line 20
            echo "\t\t\t\t<strong>";
            echo $this->env->getExtension('phpbb')->lang("NO_FOES");
            echo "</strong>
\t\t\t";
        }
        // line 22
        echo "\t\t</dd>
\t</dl>
\t<dl>
\t\t<dt><label for=\"add\">";
        // line 25
        echo $this->env->getExtension('phpbb')->lang("ADD_FOES");
        echo $this->env->getExtension('phpbb')->lang("COLON");
        echo "</label><br /><span>";
        echo $this->env->getExtension('phpbb')->lang("ADD_FOES_EXPLAIN");
        echo "</span></dt>
\t\t<dd><textarea name=\"add\" id=\"add\" rows=\"3\" cols=\"30\" class=\"inputbox\">";
        // line 26
        echo (isset($context["USERNAMES"]) ? $context["USERNAMES"] : null);
        echo "</textarea></dd>
\t\t<dd><strong><a href=\"";
        // line 27
        echo (isset($context["U_FIND_USERNAME"]) ? $context["U_FIND_USERNAME"] : null);
        echo "\" onclick=\"find_username(this.href); return false;\">";
        echo $this->env->getExtension('phpbb')->lang("FIND_USERNAME");
        echo "</a></strong></dd>
\t</dl>
\t</fieldset>

\t</div>
</div>

<fieldset class=\"submit-buttons\">
\t";
        // line 35
        echo (isset($context["S_HIDDEN_FIELDS"]) ? $context["S_HIDDEN_FIELDS"] : null);
        echo "<input type=\"reset\" value=\"";
        echo $this->env->getExtension('phpbb')->lang("RESET");
        echo "\" name=\"reset\" class=\"button2\" />&nbsp;
\t<input type=\"submit\" name=\"submit\" value=\"";
        // line 36
        echo $this->env->getExtension('phpbb')->lang("SUBMIT");
        echo "\" class=\"button1\" />
\t";
        // line 37
        echo (isset($context["S_FORM_TOKEN"]) ? $context["S_FORM_TOKEN"] : null);
        echo "
</fieldset>
</form>

";
        // line 41
        $location = "ucp_footer.html";
        $namespace = false;
        if (strpos($location, '@') === 0) {
            $namespace = substr($location, 1, strpos($location, '/') - 1);
            $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
            $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
        }
        $this->loadTemplate("ucp_footer.html", "ucp_zebra_foes.html", 41)->display($context);
        if ($namespace) {
            $this->env->setNamespaceLookUpOrder($previous_look_up_order);
        }
    }

    public function getTemplateName()
    {
        return "ucp_zebra_foes.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  136 => 41,  129 => 37,  125 => 36,  119 => 35,  106 => 27,  102 => 26,  95 => 25,  90 => 22,  84 => 20,  78 => 18,  76 => 17,  64 => 15,  61 => 14,  55 => 13,  49 => 10,  41 => 5,  34 => 3,  31 => 2,  19 => 1,);
    }
}
/* <!-- INCLUDE ucp_header.html -->*/
/* */
/* <form id="ucp" method="post" action="{S_UCP_ACTION}"{S_FORM_ENCTYPE}>*/
/* */
/* <h2>{L_TITLE}</h2>*/
/* */
/* <div class="panel">*/
/* 	<div class="inner">*/
/* */
/* 	<p>{L_FOES_EXPLAIN}</p>*/
/* */
/* 	<fieldset class="fields2">*/
/* 	<!-- IF ERROR --><p class="error">{ERROR}</p><!-- ENDIF -->*/
/* 	<dl>*/
/* 		<dt><label <!-- IF S_USERNAME_OPTIONS -->for="usernames"<!-- ENDIF -->>{L_YOUR_FOES}{L_COLON}</label><br /><span>{L_YOUR_FOES_EXPLAIN}</span></dt>*/
/* 		<dd>*/
/* 			<!-- IF S_USERNAME_OPTIONS -->*/
/* 				<select name="usernames[]" id="usernames" multiple="multiple" size="5">{S_USERNAME_OPTIONS}</select>*/
/* 			<!-- ELSE -->*/
/* 				<strong>{L_NO_FOES}</strong>*/
/* 			<!-- ENDIF -->*/
/* 		</dd>*/
/* 	</dl>*/
/* 	<dl>*/
/* 		<dt><label for="add">{L_ADD_FOES}{L_COLON}</label><br /><span>{L_ADD_FOES_EXPLAIN}</span></dt>*/
/* 		<dd><textarea name="add" id="add" rows="3" cols="30" class="inputbox">{USERNAMES}</textarea></dd>*/
/* 		<dd><strong><a href="{U_FIND_USERNAME}" onclick="find_username(this.href); return false;">{L_FIND_USERNAME}</a></strong></dd>*/
/* 	</dl>*/
/* 	</fieldset>*/
/* */
/* 	</div>*/
/* </div>*/
/* */
/* <fieldset class="submit-buttons">*/
/* 	{S_HIDDEN_FIELDS}<input type="reset" value="{L_RESET}" name="reset" class="button2" />&nbsp;*/
/* 	<input type="submit" name="submit" value="{L_SUBMIT}" class="button1" />*/
/* 	{S_FORM_TOKEN}*/
/* </fieldset>*/
/* </form>*/
/* */
/* <!-- INCLUDE ucp_footer.html -->*/
/* */
