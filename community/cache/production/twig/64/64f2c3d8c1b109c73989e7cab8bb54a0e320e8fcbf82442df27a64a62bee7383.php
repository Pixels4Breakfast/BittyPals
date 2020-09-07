<?php

/* viewonline_body.html */
class __TwigTemplate_64202bcaece0cad8eb03619cfcce78da378e1fdd593041317fda5309fc2d0706 extends Twig_Template
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
        $this->loadTemplate("overall_header.html", "viewonline_body.html", 1)->display($context);
        if ($namespace) {
            $this->env->setNamespaceLookUpOrder($previous_look_up_order);
        }
        // line 2
        echo "
<h2 class=\"viewonline-title\">";
        // line 3
        echo (isset($context["TOTAL_REGISTERED_USERS_ONLINE"]) ? $context["TOTAL_REGISTERED_USERS_ONLINE"] : null);
        echo "</h2>
<p>";
        // line 4
        echo (isset($context["TOTAL_GUEST_USERS_ONLINE"]) ? $context["TOTAL_GUEST_USERS_ONLINE"] : null);
        if ((isset($context["S_SWITCH_GUEST_DISPLAY"]) ? $context["S_SWITCH_GUEST_DISPLAY"] : null)) {
            echo " &bull; <a href=\"";
            echo (isset($context["U_SWITCH_GUEST_DISPLAY"]) ? $context["U_SWITCH_GUEST_DISPLAY"] : null);
            echo "\">";
            echo $this->env->getExtension('phpbb')->lang("SWITCH_GUEST_DISPLAY");
            echo "</a>";
        }
        echo "</p>

<div class=\"action-bar bar-top\">
\t<div class=\"pagination\">
\t\t";
        // line 8
        if (twig_length_filter($this->env, $this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "pagination", array()))) {
            // line 9
            echo "\t\t\t";
            $location = "pagination.html";
            $namespace = false;
            if (strpos($location, '@') === 0) {
                $namespace = substr($location, 1, strpos($location, '/') - 1);
                $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
                $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
            }
            $this->loadTemplate("pagination.html", "viewonline_body.html", 9)->display($context);
            if ($namespace) {
                $this->env->setNamespaceLookUpOrder($previous_look_up_order);
            }
            // line 10
            echo "\t\t";
        } else {
            // line 11
            echo "\t\t\t";
            echo (isset($context["PAGE_NUMBER"]) ? $context["PAGE_NUMBER"] : null);
            echo "
\t\t";
        }
        // line 13
        echo "\t</div>
</div>

<div class=\"forumbg forumbg-table\">
\t<div class=\"inner\">

\t<table class=\"table1\">

\t";
        // line 21
        if (twig_length_filter($this->env, $this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "user_row", array()))) {
            // line 22
            echo "\t\t<thead>
\t\t<tr>
\t\t\t<th class=\"name\"><a href=\"";
            // line 24
            echo (isset($context["U_SORT_USERNAME"]) ? $context["U_SORT_USERNAME"] : null);
            echo "\">";
            echo $this->env->getExtension('phpbb')->lang("USERNAME");
            echo "</a></th>
\t\t\t<th class=\"info\"><a href=\"";
            // line 25
            echo (isset($context["U_SORT_LOCATION"]) ? $context["U_SORT_LOCATION"] : null);
            echo "\">";
            echo $this->env->getExtension('phpbb')->lang("FORUM_LOCATION");
            echo "</a></th>
\t\t\t<th class=\"active\"><a href=\"";
            // line 26
            echo (isset($context["U_SORT_UPDATED"]) ? $context["U_SORT_UPDATED"] : null);
            echo "\">";
            echo $this->env->getExtension('phpbb')->lang("LAST_UPDATED");
            echo "</a></th>
\t\t</tr>
\t\t</thead>
\t\t<tbody>
\t\t";
            // line 30
            $context['_parent'] = $context;
            $context['_seq'] = twig_ensure_traversable($this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "user_row", array()));
            foreach ($context['_seq'] as $context["_key"] => $context["user_row"]) {
                // line 31
                echo "\t\t<tr class=\"";
                if (($this->getAttribute($context["user_row"], "S_ROW_COUNT", array()) % 2 == 1)) {
                    echo "bg1";
                } else {
                    echo "bg2";
                }
                echo "\">
\t\t\t<td>";
                // line 32
                echo $this->getAttribute($context["user_row"], "USERNAME_FULL", array());
                if ($this->getAttribute($context["user_row"], "USER_IP", array())) {
                    echo " <span style=\"float: ";
                    echo (isset($context["S_CONTENT_FLOW_END"]) ? $context["S_CONTENT_FLOW_END"] : null);
                    echo ";\">";
                    echo $this->env->getExtension('phpbb')->lang("IP");
                    echo $this->env->getExtension('phpbb')->lang("COLON");
                    echo " <a href=\"";
                    echo $this->getAttribute($context["user_row"], "U_USER_IP", array());
                    echo "\">";
                    echo $this->getAttribute($context["user_row"], "USER_IP", array());
                    echo "</a> &#187; <a href=\"";
                    echo $this->getAttribute($context["user_row"], "U_WHOIS", array());
                    echo "\" onclick=\"popup(this.href, 750, 500); return false;\">";
                    echo $this->env->getExtension('phpbb')->lang("WHOIS");
                    echo "</a></span>";
                }
                // line 33
                echo "\t\t\t\t";
                if ($this->getAttribute($context["user_row"], "USER_BROWSER", array())) {
                    echo "<br />";
                    echo $this->getAttribute($context["user_row"], "USER_BROWSER", array());
                }
                echo "</td>
\t\t\t<td class=\"info\"><a href=\"";
                // line 34
                echo $this->getAttribute($context["user_row"], "U_FORUM_LOCATION", array());
                echo "\">";
                echo $this->getAttribute($context["user_row"], "FORUM_LOCATION", array());
                echo "</a></td>
\t\t\t<td class=\"active\">";
                // line 35
                echo $this->getAttribute($context["user_row"], "LASTUPDATE", array());
                echo "</td>
\t\t</tr>
\t\t";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_iterated'], $context['_key'], $context['user_row'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 38
            echo "\t";
        } else {
            // line 39
            echo "\t\t<tbody>
\t\t<tr class=\"bg1\">
\t\t\t<td colspan=\"3\">";
            // line 41
            echo $this->env->getExtension('phpbb')->lang("NO_ONLINE_USERS");
            if ((isset($context["S_SWITCH_GUEST_DISPLAY"]) ? $context["S_SWITCH_GUEST_DISPLAY"] : null)) {
                echo " &bull; <a href=\"";
                echo (isset($context["U_SWITCH_GUEST_DISPLAY"]) ? $context["U_SWITCH_GUEST_DISPLAY"] : null);
                echo "\">";
                echo $this->env->getExtension('phpbb')->lang("SWITCH_GUEST_DISPLAY");
                echo "</a>";
            }
            echo "</td>
\t\t</tr>
\t";
        }
        // line 44
        echo "\t</tbody>
\t</table>

\t</div>
</div>

";
        // line 50
        if ((isset($context["LEGEND"]) ? $context["LEGEND"] : null)) {
            echo "<p><em>";
            echo $this->env->getExtension('phpbb')->lang("LEGEND");
            echo $this->env->getExtension('phpbb')->lang("COLON");
            echo " ";
            echo (isset($context["LEGEND"]) ? $context["LEGEND"] : null);
            echo "</em></p>";
        }
        // line 51
        echo "
<div class=\"action-bar bar-bottom\">
\t<div class=\"pagination\">
\t\t";
        // line 54
        if (twig_length_filter($this->env, $this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "pagination", array()))) {
            // line 55
            echo "\t\t\t";
            $location = "pagination.html";
            $namespace = false;
            if (strpos($location, '@') === 0) {
                $namespace = substr($location, 1, strpos($location, '/') - 1);
                $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
                $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
            }
            $this->loadTemplate("pagination.html", "viewonline_body.html", 55)->display($context);
            if ($namespace) {
                $this->env->setNamespaceLookUpOrder($previous_look_up_order);
            }
            // line 56
            echo "\t\t";
        } else {
            // line 57
            echo "\t\t\t";
            echo (isset($context["PAGE_NUMBER"]) ? $context["PAGE_NUMBER"] : null);
            echo "
\t\t";
        }
        // line 59
        echo "\t</div>
</div>

";
        // line 62
        $location = "jumpbox.html";
        $namespace = false;
        if (strpos($location, '@') === 0) {
            $namespace = substr($location, 1, strpos($location, '/') - 1);
            $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
            $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
        }
        $this->loadTemplate("jumpbox.html", "viewonline_body.html", 62)->display($context);
        if ($namespace) {
            $this->env->setNamespaceLookUpOrder($previous_look_up_order);
        }
        // line 63
        $location = "overall_footer.html";
        $namespace = false;
        if (strpos($location, '@') === 0) {
            $namespace = substr($location, 1, strpos($location, '/') - 1);
            $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
            $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
        }
        $this->loadTemplate("overall_footer.html", "viewonline_body.html", 63)->display($context);
        if ($namespace) {
            $this->env->setNamespaceLookUpOrder($previous_look_up_order);
        }
    }

    public function getTemplateName()
    {
        return "viewonline_body.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  250 => 63,  238 => 62,  233 => 59,  227 => 57,  224 => 56,  211 => 55,  209 => 54,  204 => 51,  195 => 50,  187 => 44,  174 => 41,  170 => 39,  167 => 38,  158 => 35,  152 => 34,  144 => 33,  126 => 32,  117 => 31,  113 => 30,  104 => 26,  98 => 25,  92 => 24,  88 => 22,  86 => 21,  76 => 13,  70 => 11,  67 => 10,  54 => 9,  52 => 8,  38 => 4,  34 => 3,  31 => 2,  19 => 1,);
    }
}
/* <!-- INCLUDE overall_header.html -->*/
/* */
/* <h2 class="viewonline-title">{TOTAL_REGISTERED_USERS_ONLINE}</h2>*/
/* <p>{TOTAL_GUEST_USERS_ONLINE}<!-- IF S_SWITCH_GUEST_DISPLAY --> &bull; <a href="{U_SWITCH_GUEST_DISPLAY}">{L_SWITCH_GUEST_DISPLAY}</a><!-- ENDIF --></p>*/
/* */
/* <div class="action-bar bar-top">*/
/* 	<div class="pagination">*/
/* 		<!-- IF .pagination -->*/
/* 			<!-- INCLUDE pagination.html -->*/
/* 		<!-- ELSE -->*/
/* 			{PAGE_NUMBER}*/
/* 		<!-- ENDIF -->*/
/* 	</div>*/
/* </div>*/
/* */
/* <div class="forumbg forumbg-table">*/
/* 	<div class="inner">*/
/* */
/* 	<table class="table1">*/
/* */
/* 	<!-- IF .user_row -->*/
/* 		<thead>*/
/* 		<tr>*/
/* 			<th class="name"><a href="{U_SORT_USERNAME}">{L_USERNAME}</a></th>*/
/* 			<th class="info"><a href="{U_SORT_LOCATION}">{L_FORUM_LOCATION}</a></th>*/
/* 			<th class="active"><a href="{U_SORT_UPDATED}">{L_LAST_UPDATED}</a></th>*/
/* 		</tr>*/
/* 		</thead>*/
/* 		<tbody>*/
/* 		<!-- BEGIN user_row -->*/
/* 		<tr class="<!-- IF user_row.S_ROW_COUNT is odd -->bg1<!-- ELSE -->bg2<!-- ENDIF -->">*/
/* 			<td>{user_row.USERNAME_FULL}<!-- IF user_row.USER_IP --> <span style="float: {S_CONTENT_FLOW_END};">{L_IP}{L_COLON} <a href="{user_row.U_USER_IP}">{user_row.USER_IP}</a> &#187; <a href="{user_row.U_WHOIS}" onclick="popup(this.href, 750, 500); return false;">{L_WHOIS}</a></span><!-- ENDIF -->*/
/* 				<!-- IF user_row.USER_BROWSER --><br />{user_row.USER_BROWSER}<!-- ENDIF --></td>*/
/* 			<td class="info"><a href="{user_row.U_FORUM_LOCATION}">{user_row.FORUM_LOCATION}</a></td>*/
/* 			<td class="active">{user_row.LASTUPDATE}</td>*/
/* 		</tr>*/
/* 		<!-- END user_row -->*/
/* 	<!-- ELSE -->*/
/* 		<tbody>*/
/* 		<tr class="bg1">*/
/* 			<td colspan="3">{L_NO_ONLINE_USERS}<!-- IF S_SWITCH_GUEST_DISPLAY --> &bull; <a href="{U_SWITCH_GUEST_DISPLAY}">{L_SWITCH_GUEST_DISPLAY}</a><!-- ENDIF --></td>*/
/* 		</tr>*/
/* 	<!-- ENDIF -->*/
/* 	</tbody>*/
/* 	</table>*/
/* */
/* 	</div>*/
/* </div>*/
/* */
/* <!-- IF LEGEND --><p><em>{L_LEGEND}{L_COLON} {LEGEND}</em></p><!-- ENDIF -->*/
/* */
/* <div class="action-bar bar-bottom">*/
/* 	<div class="pagination">*/
/* 		<!-- IF .pagination -->*/
/* 			<!-- INCLUDE pagination.html -->*/
/* 		<!-- ELSE -->*/
/* 			{PAGE_NUMBER}*/
/* 		<!-- ENDIF -->*/
/* 	</div>*/
/* </div>*/
/* */
/* <!-- INCLUDE jumpbox.html -->*/
/* <!-- INCLUDE overall_footer.html -->*/
/* */
