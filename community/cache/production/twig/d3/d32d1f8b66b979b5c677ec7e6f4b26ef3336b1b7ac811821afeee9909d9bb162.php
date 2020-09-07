<?php

/* ucp_notifications.html */
class __TwigTemplate_3767487566dd3f6b964a1e16a9a77a85a29ff0498796f1761ae1ea50db6740ac extends Twig_Template
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
        $this->loadTemplate("ucp_header.html", "ucp_notifications.html", 1)->display($context);
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
        echo (isset($context["TITLE"]) ? $context["TITLE"] : null);
        echo "</h2>
<div class=\"panel\">
\t<div class=\"inner\">

\t\t<p>";
        // line 9
        echo (isset($context["TITLE_EXPLAIN"]) ? $context["TITLE_EXPLAIN"] : null);
        echo "</p>

\t\t";
        // line 11
        if (((isset($context["MODE"]) ? $context["MODE"] : null) == "notification_options")) {
            // line 12
            echo "\t\t\t<table class=\"table1\">
\t\t\t\t<thead>
\t\t\t\t\t<tr>
\t\t\t\t\t\t<th>";
            // line 15
            echo $this->env->getExtension('phpbb')->lang("NOTIFICATION_TYPE");
            echo "</th>
\t\t\t\t\t\t";
            // line 16
            $context['_parent'] = $context;
            $context['_seq'] = twig_ensure_traversable($this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "notification_methods", array()));
            foreach ($context['_seq'] as $context["_key"] => $context["notification_methods"]) {
                // line 17
                echo "\t\t\t\t\t\t\t<th class=\"mark\">";
                echo $this->getAttribute($context["notification_methods"], "NAME", array());
                echo "</th>
\t\t\t\t\t\t";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_iterated'], $context['_key'], $context['notification_methods'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 19
            echo "\t\t\t\t\t</tr>
\t\t\t\t</thead>
\t\t\t\t<tbody>
\t\t\t\t";
            // line 22
            $context['_parent'] = $context;
            $context['_seq'] = twig_ensure_traversable($this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "notification_types", array()));
            foreach ($context['_seq'] as $context["_key"] => $context["notification_types"]) {
                // line 23
                echo "\t\t\t\t\t";
                if ($this->getAttribute($context["notification_types"], "GROUP_NAME", array())) {
                    // line 24
                    echo "\t\t\t\t\t\t<tr class=\"bg3\">
\t\t\t\t\t\t\t<td colspan=\"";
                    // line 25
                    echo (isset($context["NOTIFICATION_TYPES_COLS"]) ? $context["NOTIFICATION_TYPES_COLS"] : null);
                    echo "\">";
                    echo $this->getAttribute($context["notification_types"], "GROUP_NAME", array());
                    echo "</td>
\t\t\t\t\t\t</tr>
\t\t\t\t\t";
                } else {
                    // line 28
                    echo "\t\t\t\t\t\t<tr class=\"";
                    if (($this->getAttribute($context["notification_types"], "S_ROW_COUNT", array()) % 2 == 1)) {
                        echo "bg1";
                    } else {
                        echo "bg2";
                    }
                    echo "\">
\t\t\t\t\t\t\t<td>
\t\t\t\t\t\t\t\t";
                    // line 30
                    echo $this->getAttribute($context["notification_types"], "NAME", array());
                    echo "
\t\t\t\t\t\t\t\t";
                    // line 31
                    if ($this->getAttribute($context["notification_types"], "EXPLAIN", array())) {
                        echo "<br />&nbsp; &nbsp;";
                        echo $this->getAttribute($context["notification_types"], "EXPLAIN", array());
                    }
                    // line 32
                    echo "\t\t\t\t\t\t\t</td>
\t\t\t\t\t\t\t";
                    // line 33
                    $context['_parent'] = $context;
                    $context['_seq'] = twig_ensure_traversable($this->getAttribute($context["notification_types"], "notification_methods", array()));
                    foreach ($context['_seq'] as $context["_key"] => $context["notification_methods"]) {
                        // line 34
                        echo "\t\t\t\t\t\t\t\t<td class=\"mark\"><input type=\"checkbox\" name=\"";
                        echo $this->getAttribute($context["notification_types"], "TYPE", array());
                        echo "_";
                        echo $this->getAttribute($context["notification_methods"], "METHOD", array());
                        echo "\"";
                        if ($this->getAttribute($context["notification_methods"], "SUBSCRIBED", array())) {
                            echo " checked=\"checked\"";
                        }
                        echo " /></td>
\t\t\t\t\t\t\t";
                    }
                    $_parent = $context['_parent'];
                    unset($context['_seq'], $context['_iterated'], $context['_key'], $context['notification_methods'], $context['_parent'], $context['loop']);
                    $context = array_intersect_key($context, $_parent) + $_parent;
                    // line 36
                    echo "\t\t\t\t\t\t</tr>
\t\t\t\t\t";
                }
                // line 38
                echo "\t\t\t\t";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_iterated'], $context['_key'], $context['notification_types'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 39
            echo "\t\t\t\t</tbody>
\t\t\t</table>
\t\t";
        } else {
            // line 42
            echo "\t\t\t";
            if (twig_length_filter($this->env, $this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "notification_list", array()))) {
                // line 43
                echo "\t\t\t\t<div class=\"action-bar bar-top\">
\t\t\t\t\t<div class=\"pagination\">
\t\t\t\t\t\t";
                // line 45
                if ((isset($context["U_MARK_ALL"]) ? $context["U_MARK_ALL"] : null)) {
                    echo "<a href=\"";
                    echo (isset($context["U_MARK_ALL"]) ? $context["U_MARK_ALL"] : null);
                    echo "\" class=\"mark\">";
                    echo $this->env->getExtension('phpbb')->lang("NOTIFICATIONS_MARK_ALL_READ");
                    echo "</a> &bull; ";
                }
                // line 46
                echo "\t\t\t\t\t\t";
                echo $this->env->getExtension('phpbb')->lang("NOTIFICATIONS");
                echo " [<strong>";
                echo (isset($context["TOTAL_COUNT"]) ? $context["TOTAL_COUNT"] : null);
                echo "</strong>]
\t\t\t\t\t\t";
                // line 47
                if (twig_length_filter($this->env, $this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "pagination", array()))) {
                    // line 48
                    echo "\t\t\t\t\t\t\t";
                    $location = "pagination.html";
                    $namespace = false;
                    if (strpos($location, '@') === 0) {
                        $namespace = substr($location, 1, strpos($location, '/') - 1);
                        $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
                        $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
                    }
                    $this->loadTemplate("pagination.html", "ucp_notifications.html", 48)->display($context);
                    if ($namespace) {
                        $this->env->setNamespaceLookUpOrder($previous_look_up_order);
                    }
                    // line 49
                    echo "\t\t\t\t\t\t";
                } else {
                    // line 50
                    echo "\t\t\t\t\t\t\t &bull; ";
                    echo (isset($context["PAGE_NUMBER"]) ? $context["PAGE_NUMBER"] : null);
                    echo "
\t\t\t\t\t\t";
                }
                // line 52
                echo "\t\t\t\t\t</div>
\t\t\t\t</div>

\t\t\t<div class=\"notification_list\">
\t\t\t\t<ul class=\"topiclist two-columns\">
\t\t\t\t\t<li class=\"header\">
\t\t\t\t\t\t<dl>
\t\t\t\t\t\t\t<dt><div class=\"list-inner\">";
                // line 59
                echo $this->env->getExtension('phpbb')->lang("NOTIFICATIONS");
                echo "</div></dt>
\t\t\t\t\t\t\t<dd class=\"mark\">";
                // line 60
                echo $this->env->getExtension('phpbb')->lang("MARK_READ");
                echo "</dd>
\t\t\t\t\t\t</dl>
\t\t\t\t\t</li>
\t\t\t\t</ul>
\t\t\t\t<ul class=\"topiclist cplist two-columns\">
\t\t\t\t\t";
                // line 65
                $context['_parent'] = $context;
                $context['_seq'] = twig_ensure_traversable($this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "notification_list", array()));
                foreach ($context['_seq'] as $context["_key"] => $context["notification_list"]) {
                    // line 66
                    echo "\t\t\t\t\t\t<li class=\"row";
                    if ($this->getAttribute($context["notification_list"], "UNREAD", array())) {
                        echo " bg3";
                    } else {
                        if (($this->getAttribute($context["notification_list"], "S_ROW_COUNT", array()) % 2 == 1)) {
                            echo " bg1";
                        } else {
                            echo " bg2";
                        }
                    }
                    if ($this->getAttribute($context["notification_list"], "STYLING", array())) {
                        echo " ";
                        echo $this->getAttribute($context["notification_list"], "STYLING", array());
                    }
                    echo "\">
\t\t\t\t\t\t\t<dl>
\t\t\t\t\t\t\t\t<dt>
\t\t\t\t\t\t\t\t\t<div class=\"list-inner\">
\t\t\t\t\t\t\t\t\t\t";
                    // line 70
                    if ($this->getAttribute($context["notification_list"], "AVATAR", array())) {
                        echo $this->getAttribute($context["notification_list"], "AVATAR", array());
                    } else {
                        echo "<img src=\"";
                        echo (isset($context["T_THEME_PATH"]) ? $context["T_THEME_PATH"] : null);
                        echo "/images/no_avatar.gif\" alt=\"\" />";
                    }
                    // line 71
                    echo "\t\t\t\t\t\t\t\t\t\t<div class=\"notifications\">
\t\t\t\t\t\t\t\t\t\t\t";
                    // line 72
                    if ($this->getAttribute($context["notification_list"], "URL", array())) {
                        echo "<a href=\"";
                        if ($this->getAttribute($context["notification_list"], "UNREAD", array())) {
                            echo $this->getAttribute($context["notification_list"], "U_MARK_READ", array());
                        } else {
                            echo $this->getAttribute($context["notification_list"], "URL", array());
                        }
                        echo "\">";
                    }
                    // line 73
                    echo "\t\t\t\t\t\t\t\t\t\t\t<p class=\"notifications_title\">";
                    echo $this->getAttribute($context["notification_list"], "FORMATTED_TITLE", array());
                    if ($this->getAttribute($context["notification_list"], "REFERENCE", array())) {
                        echo " ";
                        echo $this->getAttribute($context["notification_list"], "REFERENCE", array());
                    }
                    echo "</p>
\t\t\t\t\t\t\t\t\t\t\t";
                    // line 74
                    if ($this->getAttribute($context["notification_list"], "URL", array())) {
                        echo "</a>";
                    }
                    // line 75
                    echo "\t\t\t\t\t\t\t\t\t\t\t";
                    if ($this->getAttribute($context["notification_list"], "FORUM", array())) {
                        echo "<p class=\"notifications_forum\">";
                        echo $this->getAttribute($context["notification_list"], "FORUM", array());
                        echo "</p>";
                    }
                    // line 76
                    echo "\t\t\t\t\t\t\t\t\t\t\t";
                    if ($this->getAttribute($context["notification_list"], "REASON", array())) {
                        echo "<p class=\"notifications_reason\">";
                        echo $this->getAttribute($context["notification_list"], "REASON", array());
                        echo "</p>";
                    }
                    // line 77
                    echo "\t\t\t\t\t\t\t\t\t\t\t<p class=\"notifications_time\">";
                    echo $this->getAttribute($context["notification_list"], "TIME", array());
                    echo "</p>
\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t</dt>

\t\t\t\t\t\t\t\t<dd class=\"mark\">&nbsp;<input type=\"checkbox\" name=\"mark[]\" value=\"";
                    // line 82
                    echo $this->getAttribute($context["notification_list"], "NOTIFICATION_ID", array());
                    echo "\"";
                    if ( !$this->getAttribute($context["notification_list"], "UNREAD", array())) {
                        echo " disabled=\"disabled\"";
                    }
                    echo " /> <dfn>";
                    echo $this->env->getExtension('phpbb')->lang("MARK_READ");
                    echo "</dfn>&nbsp;</dd>
\t\t\t\t\t\t\t</dl>
\t\t\t\t\t\t</li>
\t\t\t\t\t";
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_iterated'], $context['_key'], $context['notification_list'], $context['_parent'], $context['loop']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 86
                echo "\t\t\t\t</ul>
\t\t\t</div>

\t\t\t<div class=\"action-bar bar-bottom\">
\t\t\t\t<div class=\"pagination\">
\t\t\t\t\t";
                // line 91
                echo $this->env->getExtension('phpbb')->lang("NOTIFICATIONS");
                echo " [<strong>";
                echo (isset($context["TOTAL_COUNT"]) ? $context["TOTAL_COUNT"] : null);
                echo "</strong>]
\t\t\t\t\t";
                // line 92
                if (twig_length_filter($this->env, $this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "pagination", array()))) {
                    // line 93
                    echo "\t\t\t\t\t\t";
                    $location = "pagination.html";
                    $namespace = false;
                    if (strpos($location, '@') === 0) {
                        $namespace = substr($location, 1, strpos($location, '/') - 1);
                        $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
                        $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
                    }
                    $this->loadTemplate("pagination.html", "ucp_notifications.html", 93)->display($context);
                    if ($namespace) {
                        $this->env->setNamespaceLookUpOrder($previous_look_up_order);
                    }
                    // line 94
                    echo "\t\t\t\t\t";
                } else {
                    // line 95
                    echo "\t\t\t\t\t\t  &bull; ";
                    echo (isset($context["PAGE_NUMBER"]) ? $context["PAGE_NUMBER"] : null);
                    echo "
\t\t\t\t\t";
                }
                // line 97
                echo "\t\t\t\t</div>
\t\t\t</div>

\t\t\t";
            } else {
                // line 101
                echo "\t\t\t\t<p><strong>";
                echo $this->env->getExtension('phpbb')->lang("NO_NOTIFICATIONS");
                echo "</strong></p>
\t\t\t";
            }
            // line 103
            echo "
\t\t";
        }
        // line 105
        echo "\t</div>
</div>

";
        // line 108
        if ((twig_length_filter($this->env, $this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "notification_types", array())) || twig_length_filter($this->env, $this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "notification_list", array())))) {
            // line 109
            echo "<fieldset class=\"display-actions\">
\t<input type=\"hidden\" name=\"form_time\" value=\"";
            // line 110
            echo (isset($context["FORM_TIME"]) ? $context["FORM_TIME"] : null);
            echo "\" />
\t";
            // line 111
            echo (isset($context["S_HIDDEN_FIELDS"]) ? $context["S_HIDDEN_FIELDS"] : null);
            echo "
\t<input type=\"submit\" name=\"submit\" value=\"";
            // line 112
            if (((isset($context["MODE"]) ? $context["MODE"] : null) == "notification_options")) {
                echo $this->env->getExtension('phpbb')->lang("SUBMIT");
            } else {
                echo $this->env->getExtension('phpbb')->lang("MARK_READ");
            }
            echo "\" class=\"button1\" />
\t<div><a href=\"#\" onclick=\"\$('#ucp input:checkbox').prop('checked', true); return false;\">";
            // line 113
            echo $this->env->getExtension('phpbb')->lang("MARK_ALL");
            echo "</a> &bull; <a href=\"#\" onclick=\"\$('#ucp input:checkbox').prop('checked', false); return false;\">";
            echo $this->env->getExtension('phpbb')->lang("UNMARK_ALL");
            echo "</a></div>
\t";
            // line 114
            echo (isset($context["S_FORM_TOKEN"]) ? $context["S_FORM_TOKEN"] : null);
            echo "
</fieldset>
";
        }
        // line 117
        echo "
</form>

";
        // line 120
        $location = "ucp_footer.html";
        $namespace = false;
        if (strpos($location, '@') === 0) {
            $namespace = substr($location, 1, strpos($location, '/') - 1);
            $previous_look_up_order = $this->env->getNamespaceLookUpOrder();
            $this->env->setNamespaceLookUpOrder(array($namespace, '__main__'));
        }
        $this->loadTemplate("ucp_footer.html", "ucp_notifications.html", 120)->display($context);
        if ($namespace) {
            $this->env->setNamespaceLookUpOrder($previous_look_up_order);
        }
    }

    public function getTemplateName()
    {
        return "ucp_notifications.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  416 => 120,  411 => 117,  405 => 114,  399 => 113,  391 => 112,  387 => 111,  383 => 110,  380 => 109,  378 => 108,  373 => 105,  369 => 103,  363 => 101,  357 => 97,  351 => 95,  348 => 94,  335 => 93,  333 => 92,  327 => 91,  320 => 86,  304 => 82,  295 => 77,  288 => 76,  281 => 75,  277 => 74,  268 => 73,  258 => 72,  255 => 71,  247 => 70,  227 => 66,  223 => 65,  215 => 60,  211 => 59,  202 => 52,  196 => 50,  193 => 49,  180 => 48,  178 => 47,  171 => 46,  163 => 45,  159 => 43,  156 => 42,  151 => 39,  145 => 38,  141 => 36,  126 => 34,  122 => 33,  119 => 32,  114 => 31,  110 => 30,  100 => 28,  92 => 25,  89 => 24,  86 => 23,  82 => 22,  77 => 19,  68 => 17,  64 => 16,  60 => 15,  55 => 12,  53 => 11,  48 => 9,  41 => 5,  34 => 3,  31 => 2,  19 => 1,);
    }
}
/* <!-- INCLUDE ucp_header.html -->*/
/* */
/* <form id="ucp" method="post" action="{S_UCP_ACTION}"{S_FORM_ENCTYPE}>*/
/* */
/* <h2>{TITLE}</h2>*/
/* <div class="panel">*/
/* 	<div class="inner">*/
/* */
/* 		<p>{TITLE_EXPLAIN}</p>*/
/* */
/* 		<!-- IF MODE == 'notification_options' -->*/
/* 			<table class="table1">*/
/* 				<thead>*/
/* 					<tr>*/
/* 						<th>{L_NOTIFICATION_TYPE}</th>*/
/* 						<!-- BEGIN notification_methods -->*/
/* 							<th class="mark">{notification_methods.NAME}</th>*/
/* 						<!-- END notification_methods -->*/
/* 					</tr>*/
/* 				</thead>*/
/* 				<tbody>*/
/* 				<!-- BEGIN notification_types -->*/
/* 					<!-- IF notification_types.GROUP_NAME -->*/
/* 						<tr class="bg3">*/
/* 							<td colspan="{NOTIFICATION_TYPES_COLS}">{notification_types.GROUP_NAME}</td>*/
/* 						</tr>*/
/* 					<!-- ELSE -->*/
/* 						<tr class="<!-- IF notification_types.S_ROW_COUNT is odd -->bg1<!-- ELSE -->bg2<!-- ENDIF -->">*/
/* 							<td>*/
/* 								{notification_types.NAME}*/
/* 								<!-- IF notification_types.EXPLAIN --><br />&nbsp; &nbsp;{notification_types.EXPLAIN}<!-- ENDIF -->*/
/* 							</td>*/
/* 							<!-- BEGIN notification_methods -->*/
/* 								<td class="mark"><input type="checkbox" name="{notification_types.TYPE}_{notification_methods.METHOD}"<!-- IF notification_methods.SUBSCRIBED --> checked="checked"<!-- ENDIF --> /></td>*/
/* 							<!-- END notification_methods -->*/
/* 						</tr>*/
/* 					<!-- ENDIF -->*/
/* 				<!-- END notification_types -->*/
/* 				</tbody>*/
/* 			</table>*/
/* 		<!-- ELSE -->*/
/* 			<!-- IF .notification_list -->*/
/* 				<div class="action-bar bar-top">*/
/* 					<div class="pagination">*/
/* 						<!-- IF U_MARK_ALL --><a href="{U_MARK_ALL}" class="mark">{L_NOTIFICATIONS_MARK_ALL_READ}</a> &bull; <!-- ENDIF -->*/
/* 						{L_NOTIFICATIONS} [<strong>{TOTAL_COUNT}</strong>]*/
/* 						<!-- IF .pagination -->*/
/* 							<!-- INCLUDE pagination.html -->*/
/* 						<!-- ELSE -->*/
/* 							 &bull; {PAGE_NUMBER}*/
/* 						<!-- ENDIF -->*/
/* 					</div>*/
/* 				</div>*/
/* */
/* 			<div class="notification_list">*/
/* 				<ul class="topiclist two-columns">*/
/* 					<li class="header">*/
/* 						<dl>*/
/* 							<dt><div class="list-inner">{L_NOTIFICATIONS}</div></dt>*/
/* 							<dd class="mark">{L_MARK_READ}</dd>*/
/* 						</dl>*/
/* 					</li>*/
/* 				</ul>*/
/* 				<ul class="topiclist cplist two-columns">*/
/* 					<!-- BEGIN notification_list -->*/
/* 						<li class="row<!-- IF notification_list.UNREAD --> bg3<!-- ELSE --><!-- IF notification_list.S_ROW_COUNT is odd --> bg1<!-- ELSE --> bg2<!-- ENDIF --><!-- ENDIF --><!-- IF notification_list.STYLING --> {notification_list.STYLING}<!-- ENDIF -->">*/
/* 							<dl>*/
/* 								<dt>*/
/* 									<div class="list-inner">*/
/* 										<!-- IF notification_list.AVATAR -->{notification_list.AVATAR}<!-- ELSE --><img src="{T_THEME_PATH}/images/no_avatar.gif" alt="" /><!-- ENDIF -->*/
/* 										<div class="notifications">*/
/* 											<!-- IF notification_list.URL --><a href="<!-- IF notification_list.UNREAD -->{notification_list.U_MARK_READ}<!-- ELSE -->{notification_list.URL}<!-- ENDIF -->"><!-- ENDIF -->*/
/* 											<p class="notifications_title">{notification_list.FORMATTED_TITLE}<!-- IF notification_list.REFERENCE --> {notification_list.REFERENCE}<!-- ENDIF --></p>*/
/* 											<!-- IF notification_list.URL --></a><!-- ENDIF -->*/
/* 											<!-- IF notification_list.FORUM --><p class="notifications_forum">{notification_list.FORUM}</p><!-- ENDIF -->*/
/* 											<!-- IF notification_list.REASON --><p class="notifications_reason">{notification_list.REASON}</p><!-- ENDIF -->*/
/* 											<p class="notifications_time">{notification_list.TIME}</p>*/
/* 										</div>*/
/* 									</div>*/
/* 								</dt>*/
/* */
/* 								<dd class="mark">&nbsp;<input type="checkbox" name="mark[]" value="{notification_list.NOTIFICATION_ID}"<!-- IF not notification_list.UNREAD --> disabled="disabled"<!-- ENDIF --> /> <dfn>{L_MARK_READ}</dfn>&nbsp;</dd>*/
/* 							</dl>*/
/* 						</li>*/
/* 					<!-- END notification_list -->*/
/* 				</ul>*/
/* 			</div>*/
/* */
/* 			<div class="action-bar bar-bottom">*/
/* 				<div class="pagination">*/
/* 					{L_NOTIFICATIONS} [<strong>{TOTAL_COUNT}</strong>]*/
/* 					<!-- IF .pagination -->*/
/* 						<!-- INCLUDE pagination.html -->*/
/* 					<!-- ELSE -->*/
/* 						  &bull; {PAGE_NUMBER}*/
/* 					<!-- ENDIF -->*/
/* 				</div>*/
/* 			</div>*/
/* */
/* 			<!-- ELSE -->*/
/* 				<p><strong>{L_NO_NOTIFICATIONS}</strong></p>*/
/* 			<!-- ENDIF -->*/
/* */
/* 		<!-- ENDIF -->*/
/* 	</div>*/
/* </div>*/
/* */
/* <!-- IF .notification_types or .notification_list -->*/
/* <fieldset class="display-actions">*/
/* 	<input type="hidden" name="form_time" value="{FORM_TIME}" />*/
/* 	{S_HIDDEN_FIELDS}*/
/* 	<input type="submit" name="submit" value="<!-- IF MODE == 'notification_options' -->{L_SUBMIT}<!-- ELSE -->{L_MARK_READ}<!-- ENDIF -->" class="button1" />*/
/* 	<div><a href="#" onclick="$('#ucp input:checkbox').prop('checked', true); return false;">{L_MARK_ALL}</a> &bull; <a href="#" onclick="$('#ucp input:checkbox').prop('checked', false); return false;">{L_UNMARK_ALL}</a></div>*/
/* 	{S_FORM_TOKEN}*/
/* </fieldset>*/
/* <!-- ENDIF -->*/
/* */
/* </form>*/
/* */
/* <!-- INCLUDE ucp_footer.html -->*/
/* */
